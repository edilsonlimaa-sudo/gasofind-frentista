import type { PaymentMethod } from '@/types/sales';

// ============================================================================
// Payment Method Configuration
// ============================================================================
// Ordered by usage frequency in Venezuela (Pago Móvil most common)

export const PAYMENT_CONFIG: Record<PaymentMethod, { emoji: string }> = {
  pago_movil: { emoji: '📱' },
  cash: { emoji: '💵' },
  bank_transfer: { emoji: '🏦' },
  debit_card: { emoji: '💳' },
  credit_card: { emoji: '💳' },
  other: { emoji: '🔧' },
};

/**
 * Payment methods in display order (most used first)
 */
export const PAYMENT_METHODS_ORDERED: PaymentMethod[] = [
  'pago_movil',
  'cash',
  'bank_transfer',
  'debit_card',
  'credit_card',
  'other',
];
