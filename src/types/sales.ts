// ============================================================================
// Payment & Fuel Types
// ============================================================================

export type PaymentMethod = 
  | 'cash'             // Dinheiro
  | 'debit_card'       // Cartão de débito
  | 'credit_card'      // Cartão de crédito
  | 'bank_transfer'    // Transferência bancária
  | 'other';           // Outros métodos

export type FuelType = 
  | 'gasoline'         // Gasolina
  | 'diesel';          // Diesel

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  debit_card: 'Débito',
  credit_card: 'Crédito',
  bank_transfer: 'Transferência',
  other: 'Outro',
};

export const FuelTypeLabels: Record<FuelType, string> = {
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
