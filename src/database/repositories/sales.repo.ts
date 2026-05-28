import type { FuelType, PaymentMethod, Sale, SalesSummary } from '@/types/sales';
import { generateUUID } from '@/utils/uuid';
import { getDatabase } from '../index';

// ============================================================================
// Sales Repository
// ============================================================================

/**
 * Create a new sale
 */
export async function createSale(params: {
  shiftId: string;
  fuelType: FuelType;
  liters: number;
  pricePerLiter: number;
  paymentMethod: PaymentMethod;
}): Promise<Sale> {
  const db = await getDatabase();

  const totalAmount = params.liters * params.pricePerLiter;

  const sale: Sale = {
    id: generateUUID(),
    shiftId: params.shiftId,
    fuelType: params.fuelType,
    liters: params.liters,
    pricePerLiter: params.pricePerLiter,
    totalAmount,
    paymentMethod: params.paymentMethod,
    createdAt: new Date().toISOString(),
    deletedAt: null,
    syncStatus: 'pending',
    syncedAt: null,
    syncRetryCount: 0,
    lastSyncError: null,
    version: 1,
  };

  await db.runAsync(
    `INSERT INTO sales (
      id, shiftId, fuelType, liters, pricePerLiter, totalAmount,
      paymentMethod, createdAt, deletedAt,
      syncStatus, syncedAt, syncRetryCount, lastSyncError, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sale.id,
      sale.shiftId,
      sale.fuelType,
      sale.liters,
      sale.pricePerLiter,
      sale.totalAmount,
      sale.paymentMethod,
      sale.createdAt,
      sale.deletedAt,
      sale.syncStatus,
      sale.syncedAt,
      sale.syncRetryCount,
      sale.lastSyncError,
      sale.version,
    ]
  );

  console.log(`✅ Sale created: ${sale.id} ($${totalAmount.toFixed(2)} - ${params.paymentMethod})`);
  return sale;
}

/**
 * Get all sales for a shift (excluding deleted)
 */
export async function getSales(shiftId: string): Promise<Sale[]> {
  const db = await getDatabase();
  
  const sales = await db.getAllAsync<Sale>(
    `SELECT * FROM sales 
     WHERE shiftId = ? AND deletedAt IS NULL 
     ORDER BY createdAt DESC`,
    [shiftId]
  );

  return sales;
}

/**
 * Get all sales for a shift (including deleted, for audit)
 */
export async function getAllSalesIncludingDeleted(shiftId: string): Promise<Sale[]> {
  const db = await getDatabase();
  
  const sales = await db.getAllAsync<Sale>(
    'SELECT * FROM sales WHERE shiftId = ? ORDER BY createdAt DESC',
    [shiftId]
  );

  return sales;
}

/**
 * Get a single sale by ID
 */
export async function getSaleById(saleId: string): Promise<Sale | null> {
  const db = await getDatabase();
  
  const sale = await db.getFirstAsync<Sale>(
    'SELECT * FROM sales WHERE id = ? LIMIT 1',
    [saleId]
  );

  return sale || null;
}

/**
 * Soft delete a sale
 */
export async function deleteSale(saleId: string): Promise<void> {
  const db = await getDatabase();

  const sale = await getSaleById(saleId);
  if (!sale) {
    throw new Error('Venda não encontrada');
  }

  if (sale.deletedAt) {
    throw new Error('Esta venda já foi deletada');
  }

  const deletedAt = new Date().toISOString();

  await db.runAsync(
    `UPDATE sales 
     SET deletedAt = ?, version = version + 1 
     WHERE id = ?`,
    [deletedAt, saleId]
  );

  console.log(`🗑️  Sale soft-deleted: ${saleId}`);
}

/**
 * Restore a soft-deleted sale
 */
export async function restoreSale(saleId: string): Promise<void> {
  const db = await getDatabase();

  const sale = await getSaleById(saleId);
  if (!sale) {
    throw new Error('Venda não encontrada');
  }

  if (!sale.deletedAt) {
    throw new Error('Esta venda não está deletada');
  }

  await db.runAsync(
    `UPDATE sales 
     SET deletedAt = NULL, version = version + 1 
     WHERE id = ?`,
    [saleId]
  );

  console.log(`♻️  Sale restored: ${saleId}`);
}

/**
 * Get sales summary for a shift
 */
export async function getSalesSummary(shiftId: string): Promise<SalesSummary> {
  const db = await getDatabase();

  let overallResult: { totalSales: number; totalRevenue: number; totalLiters: number } | undefined;
  let paymentResults: { paymentMethod: PaymentMethod; count: number; revenue: number }[] = [];
  let fuelResults: { fuelType: FuelType; liters: number; revenue: number }[] = [];

  await db.withTransactionAsync(async () => {
    // Overall totals (excluding deleted)
    overallResult = await db.getFirstAsync<{
      totalSales: number;
      totalRevenue: number;
      totalLiters: number;
    }>(
      `SELECT 
         COUNT(*) as totalSales,
         COALESCE(SUM(totalAmount), 0) as totalRevenue,
         COALESCE(SUM(liters), 0) as totalLiters
       FROM sales 
       WHERE shiftId = ? AND deletedAt IS NULL`,
      [shiftId]
    ) ?? undefined;

    // By payment method
    paymentResults = await db.getAllAsync<{
      paymentMethod: PaymentMethod;
      count: number;
      revenue: number;
    }>(
      `SELECT 
         paymentMethod,
         COUNT(*) as count,
         COALESCE(SUM(totalAmount), 0) as revenue
       FROM sales 
       WHERE shiftId = ? AND deletedAt IS NULL
       GROUP BY paymentMethod`,
      [shiftId]
    );

    // By fuel type
    fuelResults = await db.getAllAsync<{
      fuelType: FuelType;
      liters: number;
      revenue: number;
    }>(
      `SELECT 
         fuelType,
         COALESCE(SUM(liters), 0) as liters,
         COALESCE(SUM(totalAmount), 0) as revenue
       FROM sales 
       WHERE shiftId = ? AND deletedAt IS NULL
       GROUP BY fuelType`,
      [shiftId]
    );
  });

  // Build summary
  const summary: SalesSummary = {
    totalSales: overallResult?.totalSales || 0,
    totalRevenue: overallResult?.totalRevenue || 0,
    totalLiters: overallResult?.totalLiters || 0,
    
    cashUsdSales: 0,
    cashUsdRevenue: 0,
    cashVesSales: 0,
    cashVesRevenue: 0,
    debitSales: 0,
    debitRevenue: 0,
    creditSales: 0,
    creditRevenue: 0,
    transferSales: 0,
    transferRevenue: 0,
    pagoMovilSales: 0,
    pagoMovilRevenue: 0,
    otherSales: 0,
    otherRevenue: 0,
    
    gasolineLiters: 0,
    gasolineRevenue: 0,
    dieselLiters: 0,
    dieselRevenue: 0,
  };

  // Fill payment method data
  for (const row of paymentResults) {
    switch (row.paymentMethod) {
      case 'cash_usd':
        summary.cashUsdSales = row.count;
        summary.cashUsdRevenue = row.revenue;
        break;
      case 'cash_ves':
        summary.cashVesSales = row.count;
        summary.cashVesRevenue = row.revenue;
        break;
      case 'debit_card':
        summary.debitSales = row.count;
        summary.debitRevenue = row.revenue;
        break;
      case 'credit_card':
        summary.creditSales = row.count;
        summary.creditRevenue = row.revenue;
        break;
      case 'bank_transfer':
        summary.transferSales = row.count;
        summary.transferRevenue = row.revenue;
        break;
      case 'pago_movil':
        summary.pagoMovilSales = row.count;
        summary.pagoMovilRevenue = row.revenue;
        break;
      case 'other':
        summary.otherSales = row.count;
        summary.otherRevenue = row.revenue;
        break;
    }
  }

  // Fill fuel type data
  for (const row of fuelResults) {
    switch (row.fuelType) {
      case 'gasoline':
        summary.gasolineLiters = row.liters;
        summary.gasolineRevenue = row.revenue;
        break;
      case 'diesel':
        summary.dieselLiters = row.liters;
        summary.dieselRevenue = row.revenue;
        break;
    }
  }

  return summary;
}

/**
 * Get recent sales across all shifts (for general history view)
 */
export async function getRecentSales(limit: number = 100): Promise<Sale[]> {
  const db = await getDatabase();
  
  const sales = await db.getAllAsync<Sale>(
    `SELECT * FROM sales 
     WHERE deletedAt IS NULL 
     ORDER BY createdAt DESC 
     LIMIT ?`,
    [limit]
  );

  return sales;
}

/**
 * Hard delete a sale (only for development/testing)
 */
export async function hardDeleteSale(saleId: string): Promise<void> {
  if (!__DEV__) {
    throw new Error('hardDeleteSale() is only available in development mode');
  }

  const db = await getDatabase();
  await db.runAsync('DELETE FROM sales WHERE id = ?', [saleId]);
  console.log(`🗑️  Sale hard-deleted: ${saleId}`);
}
