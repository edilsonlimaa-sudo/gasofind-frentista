import { PAYMENT_CONFIG, PAYMENT_METHODS_ORDERED } from '@/constants/payment-methods';
import { cn } from '@/lib/cn';
import type { PaymentMethod } from '@/types/sales';
import { PaymentMethodLabels } from '@/types/sales';
import { Pressable, Text, View } from 'react-native';

// ============================================================================
// Payment Method Selector
// ============================================================================

export interface PaymentMethodSelectorProps {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({ value, onChange, disabled }: PaymentMethodSelectorProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {PAYMENT_METHODS_ORDERED.map((method, idx) => {
        const selected = value === method;
        return (
          <Pressable
            key={method}
            onPress={() => !disabled && onChange(method)}
            className={cn(
              'items-center justify-center rounded-xl p-3 border-2 gap-1.5',
              'w-[48%]',
              selected ? 'bg-bg-border border-accent' : 'bg-bg-surface border-bg-border',
              disabled && 'opacity-40',
            )}
            style={{ minHeight: 64 }}
          >
            <Text style={{ fontSize: 24 }}>{PAYMENT_CONFIG[method].emoji}</Text>
            <Text className={cn('font-sans-bold text-xs text-center', selected ? 'text-accent' : 'text-text-muted')}>
              {PaymentMethodLabels[method]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
