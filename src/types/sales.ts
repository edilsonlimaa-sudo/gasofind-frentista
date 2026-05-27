// ============================================================================
// Payment & Fuel Types
// ============================================================================

export type PaymentMethod = 
  | 'cash'             // Dinheiro
  | 'debit_card'       // Cartão de débito
  | 'credit_card'      // Cartão de crédito
  | 'bank_transfer'    // Transferência bancária
  | 'pago_movil'       // Pago Móvil (Venezuela)
  | 'other';           // Outros métodos

/**
 * Fuel type code - must match a code in the fuel_types table
 * Common values: 'gasoline', 'diesel', but custom types can be added
 */
export type FuelType = string;

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  debit_card: 'Débito',
  credit_card: 'Crédito',
  bank_transfer: 'Transferência',
  pago_movil: 'Pago Móvil',
  other: 'Outro',
};

/**
 * @deprecated Use fuel_types table data instead of this static mapping
 * Kept for backward compatibility during migration
 */
export const FuelTypeLabels: Record<string, string> = {
  gasoline: 'Gasolina',
  diesel: 'Diesel',
};

// ============================================================================
// Sale
// ============================================================================

export interface Sale {
  id: string;                    // UUID client-side
  shiftId: string;               // FK to shifts table
  fuelType: FuelType;
  liters: number;                // Volume vendido
  pricePerLiter: number;         // Preço unitário
  totalAmount: number;           // liters × pricePerLiter
  paymentMethod: PaymentMethod;
  paymentReference: string | null; // Transaction reference (e.g., Pago Móvil code)
  createdAt: string;             // ISO 8601 timestamp
  
  // Soft delete
  deletedAt: string | null;      // ISO 8601 timestamp or null
  
  // Sync metadata (for future cloud sync)
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  syncedAt: string | null;       // ISO 8601 timestamp or null
  syncRetryCount: number;
  lastSyncError: string | null;
  version: number;               // Optimistic concurrency control
}

// ============================================================================
// Shift
// ============================================================================

export interface Shift {
  id: string;                    // UUID client-side
  operatorName: string;          // Nome do operador de caixa
  startedAt: string;             // ISO 8601 timestamp
  closedAt: string | null;       // ISO 8601 timestamp or null
  status: 'active' | 'closed';
  
  // Cash control
  initialCash: number;           // Dinheiro inicial na gaveta
  exchangeRate: number;          // Taxa do dia: Bolívares por $1
  finalCash: number | null;      // Contagem final ao fechar turno
  cashDiscrepancy: number | null; // finalCash - initialCash - cashSales
  notes: string | null;          // Observações do operador
  
  // Sync metadata
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  syncedAt: string | null;
  syncRetryCount: number;
  lastSyncError: string | null;
  version: number;
}

// ============================================================================
// Aggregated Summaries
// ============================================================================

export interface SalesSummary {
  totalSales: number;            // Quantidade de vendas
  totalRevenue: number;          // Soma de totalAmount
  totalLiters: number;           // Soma de liters
  
  // By payment method
  cashSales: number;             // Quantidade
  cashRevenue: number;           // Valor total
  debitSales: number;
  debitRevenue: number;
  creditSales: number;
  creditRevenue: number;
  transferSales: number;
  transferRevenue: number;
  otherSales: number;
  otherRevenue: number;
  
  // By fuel type
  gasolineLiters: number;
  gasolineRevenue: number;
  dieselLiters: number;
  dieselRevenue: number;
}

export interface ShiftReport extends Shift {
  summary: SalesSummary;
  sales: Sale[];
}

// ============================================================================
// Payment Breakdown Item (for UI)
// ============================================================================

export interface PaymentBreakdownItem {
  method: PaymentMethod;
  label: string;
  count: number;
  total: number;
}
