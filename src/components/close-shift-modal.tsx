import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { getSalesSummary } from '@/database/repositories';
import type { SalesSummary } from '@/types/sales';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ============================================================================
// Close Shift Modal
// ============================================================================

export interface CloseShiftModalProps {
  visible: boolean;
  shiftId: string;
  initialCash: number;
  onConfirm: (finalCash: number, notes?: string) => Promise<void>;
  onCancel: () => void;
}

export function CloseShiftModal({ visible, shiftId, initialCash, onConfirm, onCancel }: CloseShiftModalProps) {
  const insets = useSafeAreaInsets();
  const { showToast, ToastComponent } = useToast();
  const [finalCash, setFinalCash] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (visible && shiftId) {
      loadSummary();
    }
  }, [visible, shiftId]);

  const loadSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const data = await getSalesSummary(shiftId);
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleConfirm = async () => {
    const cash = parseFloat(finalCash.replace(/,/g, '.'));

    if (isNaN(cash) || cash < 0) {
      showToast('Por favor, informe um valor válido para o dinheiro final', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(cash, notes.trim() || undefined);
      // Reset form
      setFinalCash('');
      setNotes('');
      setSummary(null);
    } catch (error: any) {
      showToast(error.message || 'Erro ao fechar turno', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cashSales = summary?.cashRevenue || 0;
  const expectedCash = initialCash + cashSales;
  const finalCashNum = parseFloat(finalCash.replace(/,/g, '.'));
  const discrepancy = !isNaN(finalCashNum) ? finalCashNum - expectedCash : 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior="padding"
        enabled={Platform.OS === 'ios'}
        className="flex-1 justify-end"
      >
        <Pressable
          className="flex-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={onCancel}
        />
        <View className="bg-bg-surface rounded-t-3xl px-6 pt-6 max-h-[90%]" style={{ paddingBottom: insets.bottom + 24 }}>
          {/* Handle bar */}
          <View className="w-10 h-1 bg-bg-border rounded-full self-center mb-4" />

          <Text className="font-display-bold text-2xl text-text-primary mb-4">Fechar Turno</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4 pb-2">
            {isLoadingSummary ? (
              <ActivityIndicator color="#00B8D9" className="my-8" />
            ) : summary ? (
              <>
                {/* Sales Summary */}
                <View className="bg-bg-base rounded-2xl p-4 gap-2">
                  <Text className="font-display text-base text-text-primary mb-1">Resumo de Vendas</Text>

                  <View className="flex-row justify-between items-center">
                    <Text className="font-sans text-sm text-text-muted">Total de vendas</Text>
                    <Text className="font-sans-bold text-sm text-text-primary">{summary.totalSales}</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="font-sans text-sm text-text-muted">Receita total</Text>
                    <Text className="font-mono-bold text-sm text-text-primary">${summary.totalRevenue.toFixed(2)}</Text>
                  </View>

                  <View className="h-px bg-bg-border my-1" />
                  <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">Por pagamento</Text>

                  {summary.cashRevenue > 0 && (
                    <View className="flex-row justify-between items-center">
                      <Text className="font-sans text-sm text-text-muted">💵 Dinheiro</Text>
                      <Text className="font-mono text-sm text-text-primary">${summary.cashRevenue.toFixed(2)}</Text>
                    </View>
                  )}
                  {summary.debitRevenue > 0 && (
                    <View className="flex-row justify-between items-center">
                      <Text className="font-sans text-sm text-text-muted">💳 Débito</Text>
                      <Text className="font-mono text-sm text-text-primary">${summary.debitRevenue.toFixed(2)}</Text>
                    </View>
                  )}
                  {summary.creditRevenue > 0 && (
                    <View className="flex-row justify-between items-center">
                      <Text className="font-sans text-sm text-text-muted">💳 Crédito</Text>
                      <Text className="font-mono text-sm text-text-primary">${summary.creditRevenue.toFixed(2)}</Text>
                    </View>
                  )}
                  {summary.transferRevenue > 0 && (
                    <View className="flex-row justify-between items-center">
                      <Text className="font-sans text-sm text-text-muted">🏦 Transferência</Text>
                      <Text className="font-mono text-sm text-text-primary">${summary.transferRevenue.toFixed(2)}</Text>
                    </View>
                  )}
                  {summary.pagoMovilRevenue > 0 && (
                    <View className="flex-row justify-between items-center">
                      <Text className="font-sans text-sm text-text-muted">📱 Pago Móvil</Text>
                      <Text className="font-mono text-sm text-text-primary">${summary.pagoMovilRevenue.toFixed(2)}</Text>
                    </View>
                  )}
                  {summary.otherRevenue > 0 && (
                    <View className="flex-row justify-between items-center">
                      <Text className="font-sans text-sm text-text-muted">🔧 Outro</Text>
                      <Text className="font-mono text-sm text-text-primary">${summary.otherRevenue.toFixed(2)}</Text>
                    </View>
                  )}
                </View>

                {/* Cash Control */}
                <View className="bg-bg-base rounded-2xl p-4 gap-2">
                  <Text className="font-display text-base text-text-primary mb-1">Controle de Caixa</Text>

                  <View className="flex-row justify-between items-center">
                    <Text className="font-sans text-sm text-text-muted">Dinheiro inicial</Text>
                    <Text className="font-mono text-sm text-text-primary">${initialCash.toFixed(2)}</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="font-sans text-sm text-text-muted">Vendas em dinheiro</Text>
                    <Text className="font-mono text-sm text-text-primary">${cashSales.toFixed(2)}</Text>
                  </View>

                  <View className="h-px bg-bg-border my-1" />

                  <View className="flex-row justify-between items-center">
                    <Text className="font-sans-bold text-sm text-accent">Esperado na gaveta</Text>
                    <Text className="font-mono-bold text-base text-accent">${expectedCash.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Final Cash Input */}
                <View className="gap-2">
                  <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
                    Dinheiro contado na gaveta (USD)
                  </Text>
                  <View className="flex-row items-center bg-bg-base border border-bg-border rounded-xl overflow-hidden">
                    <View className="px-4 border-r border-bg-border bg-bg-border" style={{ height: 56, justifyContent: 'center' }}>
                      <Text className="font-sans-bold text-text-muted text-base">$</Text>
                    </View>
                    <TextInput
                      className="flex-1 font-mono text-text-primary text-2xl px-4"
                      value={finalCash}
                      onChangeText={(text) => setFinalCash(text.replace(/[^0-9.,]/g, ''))}
                      placeholder="0.00"
                      placeholderTextColor="#6B7F95"
                      keyboardType="decimal-pad"
                      editable={!isSubmitting}
                      returnKeyType="next"
                      style={{ height: 56 }}
                    />
                  </View>
                </View>

                {/* Discrepancy Card */}
                {!isNaN(finalCashNum) && finalCash !== '' && (
                  <View
                    className="rounded-2xl p-4 items-center gap-1 border-2"
                    style={{
                      backgroundColor: '#080C12',
                      borderColor: Math.abs(discrepancy) <= 0.01
                        ? '#00E5A0'
                        : discrepancy > 0
                          ? '#00E5A0'
                          : '#FF3F5B',
                    }}
                  >
                    <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">Diferença</Text>
                    <Text
                      className="font-mono-bold text-4xl"
                      style={{ color: discrepancy < 0 ? '#FF3F5B' : '#00E5A0' }}
                    >
                      {discrepancy > 0 && '+'}{discrepancy.toFixed(2)}
                    </Text>
                    {Math.abs(discrepancy) > 0.01 && (
                      <Text className="font-sans text-xs text-text-muted">
                        {discrepancy > 0 ? 'Sobrou dinheiro' : 'Faltou dinheiro'}
                      </Text>
                    )}
                  </View>
                )}

                {/* Notes */}
                <View className="gap-2">
                  <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
                    Observações (opcional)
                  </Text>
                  <TextInput
                    className="bg-bg-base border border-bg-border rounded-xl px-4 py-3 text-text-primary font-sans text-base"
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Adicione observações sobre o turno..."
                    placeholderTextColor="#6B7F95"
                    multiline
                    numberOfLines={3}
                    editable={!isSubmitting}
                    returnKeyType="done"
                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                  />
                </View>
              </>
            ) : null}

            {/* Actions */}
            <View className="flex-row gap-3 mt-2">
              <Button variant="secondary" onPress={onCancel} disabled={isSubmitting} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onPress={handleConfirm}
                loading={isSubmitting}
                disabled={isLoadingSummary}
                className="flex-1"
              >
                Fechar Turno
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      {ToastComponent}
    </Modal>
  );
}
