import type { Shift } from '@/types/sales';
import { generateUUID } from '@/utils/uuid';
import { getDatabase } from '../index';

// ============================================================================
// Shifts Repository
// ============================================================================

/**
 * Start a new shift
 * Only one shift can be active at a time
 */
export async function startShift(
  operatorName: string,
  initialCashUsd: number = 0,
  initialCashVes: number = 0,
  exchangeRate: number = 1
): Promise<Shift> {
  const db = await getDatabase();

  // Check if there's already an active shift
  const existingShift = await db.getFirstAsync<Shift>(
    'SELECT * FROM shifts WHERE status = ? LIMIT 1',
    ['active']
  );

  if (existingShift) {
    throw new Error('Já existe um turno ativo. Feche o turno atual antes de iniciar um novo.');
  }

  const shift: Shift = {
    id: generateUUID(),
    operatorName: operatorName.trim(),
    startedAt: new Date().toISOString(),
    closedAt: null,
    status: 'active',
    initialCashUsd,
    initialCashVes,
    exchangeRate,
    finalCashUsd: null,
    finalCashVes: null,
    cashDiscrepancyUsd: null,
    cashDiscrepancyVes: null,
    notes: null,
    syncStatus: 'pending',
    syncedAt: null,
    syncRetryCount: 0,
    lastSyncError: null,
    version: 1,
  };

  await db.runAsync(
    `INSERT INTO shifts (
      id, operatorName, startedAt, closedAt, status,
      initialCashUsd, initialCashVes, exchangeRate,
      finalCashUsd, finalCashVes, cashDiscrepancyUsd, cashDiscrepancyVes, notes,
      syncStatus, syncedAt, syncRetryCount, lastSyncError, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      shift.id,
      shift.operatorName,
      shift.startedAt,
      shift.closedAt,
      shift.status,
      shift.initialCashUsd,
      shift.initialCashVes,
      shift.exchangeRate,
      shift.finalCashUsd,
      shift.finalCashVes,
      shift.cashDiscrepancyUsd,
      shift.cashDiscrepancyVes,
      shift.notes,
      shift.syncStatus,
      shift.syncedAt,
      shift.syncRetryCount,
      shift.lastSyncError,
      shift.version,
    ]
  );

  console.log(`✅ Shift started: ${shift.id} (${operatorName})`);
  return shift;
}

/**
 * Get the current active shift (if any)
 */
export async function getCurrentShift(): Promise<Shift | null> {
  const db = await getDatabase();
  
  const shift = await db.getFirstAsync<Shift>(
    'SELECT * FROM shifts WHERE status = ? LIMIT 1',
    ['active']
  );

  return shift || null;
}

/**
 * Get a shift by ID
 */
export async function getShiftById(shiftId: string): Promise<Shift | null> {
  const db = await getDatabase();
  
  const shift = await db.getFirstAsync<Shift>(
    'SELECT * FROM shifts WHERE id = ? LIMIT 1',
    [shiftId]
  );

  return shift || null;
}

/**
 * Close a shift
 * Calculates cash discrepancy based on cash sales (USD and VES separately)
 */
export async function closeShift(
  shiftId: string,
  finalCashUsd: number,
  finalCashVes: number,
  notes?: string
): Promise<Shift> {
  const db = await getDatabase();

  // Get the shift
  const shift = await getShiftById(shiftId);
  if (!shift) {
    throw new Error('Turno não encontrado');
  }

  if (shift.status === 'closed') {
    throw new Error('Este turno já foi fechado');
  }

  // Calculate USD cash sales total (only non-deleted cash_usd sales)
  const cashUsdSalesResult = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(totalAmount), 0) as total 
     FROM sales 
     WHERE shiftId = ? 
       AND paymentMethod = ? 
       AND deletedAt IS NULL`,
    [shiftId, 'cash_usd']
  );

  // Calculate VES cash sales total (only non-deleted cash_ves sales)
  const cashVesSalesResult = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(totalAmount), 0) as total 
     FROM sales 
     WHERE shiftId = ? 
       AND paymentMethod = ? 
       AND deletedAt IS NULL`,
    [shiftId, 'cash_ves']
  );

  const cashUsdSalesTotal = cashUsdSalesResult?.total || 0;
  const cashVesSalesTotal = cashVesSalesResult?.total || 0;

  // Cash discrepancy = (finalCash - initialCash) - cashSales (per currency)
  // Positive = sobrou dinheiro, Negative = faltou dinheiro
  const expectedCashUsd = shift.initialCashUsd + cashUsdSalesTotal;
  const expectedCashVes = shift.initialCashVes + cashVesSalesTotal;
  const cashDiscrepancyUsd = finalCashUsd - expectedCashUsd;
  const cashDiscrepancyVes = finalCashVes - expectedCashVes;

  const closedAt = new Date().toISOString();

  await db.runAsync(
    `UPDATE shifts 
     SET status = ?,
         closedAt = ?,
         finalCashUsd = ?,
         finalCashVes = ?,
         cashDiscrepancyUsd = ?,
         cashDiscrepancyVes = ?,
         notes = ?,
         version = version + 1
     WHERE id = ?`,
    ['closed', closedAt, finalCashUsd, finalCashVes, cashDiscrepancyUsd, cashDiscrepancyVes, notes || null, shiftId]
  );

  console.log(`✅ Shift closed: ${shiftId} (USD: $${cashDiscrepancyUsd.toFixed(2)}, Bs: $${cashDiscrepancyVes.toFixed(2)})`);

  // Return updated shift
  const updatedShift = await getShiftById(shiftId);
  if (!updatedShift) {
    throw new Error('Erro ao recuperar turno atualizado');
  }

  return updatedShift;
}

/**
 * Get all shifts (for reports)
 * Ordered by most recent first
 */
export async function getAllShifts(limit: number = 50): Promise<Shift[]> {
  const db = await getDatabase();
  
  const shifts = await db.getAllAsync<Shift>(
    'SELECT * FROM shifts ORDER BY startedAt DESC LIMIT ?',
    [limit]
  );

  return shifts;
}

/**
 * Get closed shifts only
 */
export async function getClosedShifts(limit: number = 50): Promise<Shift[]> {
  const db = await getDatabase();
  
  const shifts = await db.getAllAsync<Shift>(
    'SELECT * FROM shifts WHERE status = ? ORDER BY closedAt DESC LIMIT ?',
    ['closed', limit]
  );

  return shifts;
}

/**
 * Delete a shift (HARD DELETE - only for development)
 * Also deletes all associated sales (CASCADE)
 */
export async function deleteShift(shiftId: string): Promise<void> {
  if (!__DEV__) {
    throw new Error('deleteShift() is only available in development mode');
  }

  const db = await getDatabase();
  await db.runAsync('DELETE FROM shifts WHERE id = ?', [shiftId]);
  console.log(`🗑️  Shift deleted: ${shiftId}`);
}
