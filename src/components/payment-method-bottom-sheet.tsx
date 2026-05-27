import { PAYMENT_CONFIG, PAYMENT_METHODS_ORDERED } from '@/constants/payment-methods';
import { cn } from '@/lib/cn';
import type { PaymentMethod } from '@/types/sales';
import { PaymentMethodLabels } from '@/types/sales';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ============================================================================
// Payment Method Bottom Sheet Component
// ============================================================================

export interface PaymentMethodBottomSheetProps {
  visible: boolean;
  value: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  onClose: () => void;
}

export function PaymentMethodBottomSheet({
  visible,
  value,
  onSelect,
  onClose,
}: PaymentMethodBottomSheetProps) {
  const insets = useSafeAreaInsets();

  const handleMethodSelect = (method: PaymentMethod) => {
    onSelect(method);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onPress={onClose}
      />
      <View
        className="bg-bg-surface rounded-t-3xl"
        style={{
          maxHeight: '70%',
          paddingBottom: insets.bottom + 24,
        }}
      >
        <ScrollView
          className="px-6 pt-6"
          contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Handle bar */}
          <View className="w-10 h-1 bg-bg-border rounded-full self-center mb-1" />

          <Text className="font-display-bold text-2xl text-text-primary">
            Forma de Pagamento
          </Text>

          {/* Payment methods list */}
          <View className="gap-2 pb-4">
            {PAYMENT_METHODS_ORDERED.map((method) => {
              const isSelected = value === method;
              return (
                <Pressable
                  key={method}
                  onPress={() => handleMethodSelect(method)}
                  className={cn(
                    'flex-row items-center gap-4 rounded-xl p-4 border-2',
                    isSelected
                      ? 'bg-accent/20 border-accent'
                      : 'bg-bg-base border-bg-border'
                  )}
                  style={{ minHeight: 64 }}
                >
                  <Text style={{ fontSize: 32 }}>{PAYMENT_CONFIG[method].emoji}</Text>
                  <Text
                    className={cn(
                      'font-sans-bold text-lg flex-1',
                      isSelected ? 'text-accent' : 'text-text-primary'
                    )}
                  >
                    {PaymentMethodLabels[method]}
                  </Text>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-accent items-center justify-center">
                      <Text className="text-bg-base font-sans-bold text-xs">✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
