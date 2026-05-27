import { FuelTypeSelector } from '@/components/fuel-type-selector';
import { PaymentMethodBottomSheet } from '@/components/payment-method-bottom-sheet';
import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { VolumeInput } from '@/components/volume-input';
import { PAYMENT_CONFIG } from '@/constants/payment-methods';
import { useShift } from '@/contexts/shift-context';
import { createSale, getFuelTypeByCode } from '@/database/repositories';
import type { FuelType, PaymentMethod } from '@/types/sales';
import { PaymentMethodLabels } from '@/types/sales';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Sale() {
  const { currentShift } = useShift();
  const { showToast, ToastComponent } = useToast();

  const [fuelType, setFuelType] = useState<FuelType | null>(null);
  const [liters, setLiters] = useState('');
  const [lockedPrice, setLockedPrice] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
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

  // Clear payment reference when payment method changes away from pago_movil
  useEffect(() => {
    if (paymentMethod !== 'pago_movil') {
      setPaymentReference('');
    }
  }, [paymentMethod]);

  const handleSelectPayment = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setIsPaymentSheetOpen(false);
  };

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
        paymentReference: paymentReference.trim() || undefined,
      });

      setFuelType(null);
      setLiters('');
      setPaymentMethod(null);
      setPaymentReference('');

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
            
            {/* Payment selection - button when null, compact card when selected */}
            {paymentMethod === null ? (
              <Pressable
                onPress={() => !isSubmitting && setIsPaymentSheetOpen(true)}
                className="flex-row items-center justify-between bg-bg-surface border-2 border-bg-border rounded-xl px-4"
                style={{ height: 64 }}
                disabled={isSubmitting}
              >
                <Text className="font-sans text-base text-text-muted">
                  Selecionar forma de pagamento
                </Text>
                <Text className="text-text-muted text-xl">→</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => !isSubmitting && setIsPaymentSheetOpen(true)}
                className="flex-row items-center gap-3 bg-bg-surface border border-bg-border rounded-xl px-4"
                style={{ height: 64 }}
                disabled={isSubmitting}
              >
                <Text style={{ fontSize: 28 }}>{PAYMENT_CONFIG[paymentMethod].emoji}</Text>
                <Text className="font-sans-bold text-base text-text-primary flex-1">
                  {PaymentMethodLabels[paymentMethod]}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="font-sans text-sm text-accent">Alterar</Text>
                  <Text className="text-accent text-lg">→</Text>
                </View>
              </Pressable>
            )}
            
            {/* Pago Móvil Reference Field */}
            {paymentMethod === 'pago_movil' && (
              <View className="mt-3 gap-1.5">
                <Text className="font-sans text-sm text-text-muted pl-1">
                  Referência do Pago Móvil <Text className="text-text-muted/50">(opcional)</Text>
                </Text>
                <TextInput
                  className="bg-bg-surface border border-bg-border rounded-xl px-4 font-mono text-base text-text-primary"
                  style={{ height: 56 }}
                  value={paymentReference}
                  onChangeText={setPaymentReference}
                  placeholder="Digite a referência..."
                  placeholderTextColor="#6B7F95"
                  editable={!isSubmitting}
                  keyboardType="numeric"
                />
              </View>
            )}
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

      <PaymentMethodBottomSheet
        visible={isPaymentSheetOpen}
        value={paymentMethod}
        onSelect={handleSelectPayment}
        onClose={() => setIsPaymentSheetOpen(false)}
      />

      {ToastComponent}
    </SafeAreaView>
  );
}
