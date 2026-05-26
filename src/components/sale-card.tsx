import type { Sale } from '@/types/sales';
import { FuelTypeLabels, PaymentMethodLabels } from '@/types/sales';
import { Text, View } from 'react-native';

export interface SaleCardProps {
  sale: Sale;
  exchangeRate?: number;
}

const FUEL_EMOJI: Record<string, string> = {
  gasoline: '⛽',
  diesel: '🚛',
};

const PAYMENT_EMOJI: Record<string, string> = {
  cash: '💵',
  debit_card: '💳',
  credit_card: '💳',
  bank_transfer: '🏦',
  other: '📱',
};

export function SaleCard({ sale, exchangeRate }: SaleCardProps) {
  const time = new Date(sale.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View className="bg-bg-surface border border-bg-border rounded-2xl p-4 gap-3">
      {/* Row 1: fuel + payment + time */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text style={{ fontSize: 20 }}>{FUEL_EMOJI[sale.fuelType]}</Text>
          <Text className="font-sans-bold text-sm text-text-primary">
            {FuelTypeLabels[sale.fuelType]}
          </Text>
          <View className="w-px h-3 bg-bg-border" />
          <Text style={{ fontSize: 14 }}>{PAYMENT_EMOJI[sale.paymentMethod]}</Text>
          <Text className="font-sans text-xs text-text-muted">
            {PaymentMethodLabels[sale.paymentMethod]}
          </Text>
        </View>
        <Text className="font-mono text-xs text-text-muted">{time}</Text>
      </View>

      {/* Row 2: quantity formula + total */}
      <View className="flex-row items-center justify-between border-t border-bg-border pt-3">
        <Text className="font-sans text-sm text-text-muted">
          {sale.liters.toFixed(1)}L × ${sale.pricePerLiter.toFixed(2)}/L
        </Text>
        <View className="items-end">
          <Text className="font-mono-bold text-lg text-accent">
            ${sale.totalAmount.toFixed(2)}
          </Text>
          {exchangeRate && exchangeRate > 1 && (
            <Text className="font-mono text-xs text-text-muted">
              Bs {(sale.totalAmount * exchangeRate).toFixed(0)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

