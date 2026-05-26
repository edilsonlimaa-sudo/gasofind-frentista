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

const PAYMENT_CONFIG: Record<PaymentMethod, { emoji: string }> = {
  cash: { emoji: '💵' },
  debit_card: { emoji: '💳' },
  credit_card: { emoji: '💳' },
  bank_transfer: { emoji: '🏦' },
  other: { emoji: '📱' },
};

const METHODS = Object.keys(PAYMENT_CONFIG) as PaymentMethod[];

export function PaymentMethodSelector({ value, onChange, disabled }: PaymentMethodSelectorProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {METHODS.map((method, idx) => {
        const selected = value === method;
        const isLast = idx === METHODS.length - 1;
        return (
          <Pressable
            key={method}
            onPress={() => !disabled && onChange(method)}
            className={cn(
              'items-center justify-center rounded-xl p-3 border-2 gap-1.5',
              isLast ? 'flex-1' : 'w-[48%]',
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
