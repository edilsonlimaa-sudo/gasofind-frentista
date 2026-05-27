import { FuelTypeSelector } from '@/components/fuel-type-selector';
import { PaymentMethodSelector } from '@/components/payment-method-selector';
import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { VolumeInput } from '@/components/volume-input';
import { useShift } from '@/contexts/shift-context';
import { createSale, getFuelTypeByCode } from '@/database/repositories';
import type { FuelType, PaymentMethod } from '@/types/sales';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Sale() {
  const { currentShift } = useShift();
  const { showToast, ToastComponent } = useToast();

  const [fuelType, setFuelType] = useState<FuelType | null>(null);
  const [liters, setLiters] = useState('');
  const [lockedPrice, setLockedPrice] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentShift) {
      router.replace('/');
    }
  }, [currentShift]);

  // Load locked price from database whenever fuel type changes
  useEffect(() => {
    if (!fuelType) {
      setLockedPrice(null);
      return;
    }
    
    getFuelTypeByCode(fuelType).then((fuelTypeData) => {
      if (fuelTypeData) {
        setLockedPrice(fuelTypeData.pricePerLiter);
      } else {
        console.warn(`Fuel type ${fuelType} not found in database`);
        setLockedPrice(null);
      }
    }).catch((error) => {
      console.error('Error loading fuel type price:', error);
      setLockedPrice(null);
    });
  }, [fuelType]);

  const handleSubmitSale = async () => {
    if (!currentShift || !lockedPrice) return;

    if (!fuelType) {
      showToast('Selecione o tipo de combustível', 'error');
      return;
    }
    if (!paymentMethod) {
      showToast('Selecione a forma de pagamento', 'error');
      return;
    }

    const litersNum = parseFloat(liters.replace(/,/g, '.'));

    if (!liters || isNaN(litersNum) || litersNum <= 0) {
      showToast('Informe uma quantidade válida de litros', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSale({
        shiftId: currentShift.id,
        fuelType,
        liters: litersNum,
        pricePerLiter: lockedPrice,
        paymentMethod,
      });

      setFuelType(null);
      setLiters('');
      setPaymentMethod(null);

      showToast('Venda registrada!', 'success');
      router.back();
    } catch (error: any) {
      console.error('Error creating sale:', error);
      showToast('Erro ao registrar venda', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const litersNum = parseFloat(liters.replace(/,/g, '.'));
  const totalUSD =
    lockedPrice && !isNaN(litersNum) && litersNum > 0 ? litersNum * lockedPrice : 0;
  const totalBs =
    totalUSD > 0 && currentShift ? totalUSD * currentShift.exchangeRate : 0;

  const canSubmit =
    !isSubmitting && fuelType && liters && lockedPrice && paymentMethod && litersNum > 0;

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-3 flex-row items-center gap-3 border-b border-bg-border">
          <Pressable
            className="w-10 h-10 rounded-xl bg-bg-surface border border-bg-border items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-text-primary text-xl">←</Text>
          </Pressable>
          <Text className="font-display-bold text-xl text-text-primary">Nova Venda</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <SectionHeader step={1} title="Combustível" />
            <FuelTypeSelector 
              value={fuelType} 
              onChange={setFuelType} 
              disabled={isSubmitting}
              autoSelectSingle
            />
          </View>

          {/* Locked price badge — shown once fuel type is selected */}
          {lockedPrice !== null && (
            <View className="flex-row items-center bg-bg-surface border border-bg-border rounded-xl px-4 gap-3" style={{ height: 56 }}>
              <Text className="font-sans text-sm text-text-muted flex-1">Preço por litro</Text>
              <Text className="font-mono-bold text-xl text-text-primary">
                ${lockedPrice.toFixed(2)}/L
              </Text>
              <View className="bg-bg-border rounded-lg px-2 py-1">
                <Text className="font-sans text-xs text-text-muted">fixo</Text>
              </View>
            </View>
          )}

          <View>
            <SectionHeader step={2} title="Quantidade" />
            <VolumeInput value={liters} onChange={setLiters} disabled={isSubmitting} />
          </View>

          {/* Total: shown when liters and price are both set */}
          {totalUSD > 0 && (
            <View className="bg-bg-base border-2 border-accent rounded-2xl p-4 gap-1">
              <View className="flex-row justify-between items-baseline">
                <Text className="font-sans-bold text-base text-text-muted">Total estimado</Text>
                <Text className="font-mono-bold text-3xl text-accent">${totalUSD.toFixed(2)}</Text>
              </View>
              {totalBs > 0 && (
                <View className="flex-row justify-end">
                  <Text className="font-mono text-base text-text-muted">
                    Bs {totalBs.toFixed(0)}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View>
            <SectionHeader step={3} title="Pagamento" />
            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
              disabled={isSubmitting}
            />
          </View>
        </ScrollView>

        {/* Sticky submit */}
        <View className="px-4 py-3 border-t border-bg-border bg-bg-base">
          <Button
            onPress={handleSubmitSale}
            disabled={!canSubmit}
            loading={isSubmitting}
            size="lg"
          >
            Registrar Venda
          </Button>
        </View>
      </KeyboardAvoidingView>

      {ToastComponent}
    </SafeAreaView>
  );
}
