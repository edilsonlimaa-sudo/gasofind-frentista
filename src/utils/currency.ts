import type { PaymentMethod } from '@/types/sales';

/**
 * Currency Formatting Utilities
 * 
 * Venezuela uses TWO currencies:
 * - USD (Dólares): Physical dollar bills (divisa) - premium currency
 * - Bs (Bolívares): Local currency - used for Pago Móvil, transfers, etc.
 */

/**
 * Format amount as USD
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "$62.50"
 */
export function formatUSD(amount: number, decimals: number = 2): string {
  return `$${amount.toFixed(decimals)}`;
}

/**
 * Format amount as Bolívares
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2, use 0 for large amounts)
 * @returns Formatted string like "Bs 30000.00"
 */
export function formatBs(amount: number, decimals: number = 2): string {
  return `Bs ${amount.toFixed(decimals)}`;
}

/**
 * Payment methods that use Bolívares
 * All other methods use USD
 */
const BS_PAYMENT_METHODS: PaymentMethod[] = [
  'cash_ves',      // Physical Bolívares bills
  'pago_movil',    // Mobile payment (Venezuela's most popular, always Bs)
  'bank_transfer', // Bank transfers (always Bs in Venezuela)
];

/**
 * Format amount based on payment method
 * USD methods: cash_usd, debit_card, credit_card
 * Bs methods: cash_ves, pago_movil, bank_transfer
 * 
 * @param amount - The amount to format
 * @param method - The payment method
 * @param decimals - Number of decimal places (optional)
 * @returns Formatted string with correct currency symbol
 */
export function formatPaymentAmount(
  amount: number,
  method: PaymentMethod,
  decimals?: number
): string {
  const isBs = BS_PAYMENT_METHODS.includes(method);
  return isBs ? formatBs(amount, decimals) : formatUSD(amount, decimals);
}

/**
 * Convert USD to Bolívares using exchange rate
 * @param usd - Amount in USD
 * @param exchangeRate - Current exchange rate (Bs per $1)
 * @param decimals - Number of decimal places (default: 0 for Bs)
 * @returns Formatted Bolívares string like "Bs 3753"
 */
export function convertToVes(
  usd: number,
  exchangeRate: number,
  decimals: number = 0
): string {
  return formatBs(usd * exchangeRate, decimals);
}

/**
 * Check if a payment method uses Bolívares
 * @param method - The payment method to check
 * @returns true if method uses Bs, false if USD
 */
export function isBolivaresMethod(method: PaymentMethod): boolean {
  return BS_PAYMENT_METHODS.includes(method);
}
