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
  initialCashUsd: number;
  initialCashVes: number;
  exchangeRate: number;
  onConfirm: (finalCashUsd: number, finalCashVes: number, notes?: string) => Promise<void>;
  onCancel: () => void;
}

export function CloseShiftModal({ visible, shiftId, initialCashUsd, initialCashVes, exchangeRate, onConfirm, onCancel }: CloseShiftModalProps) {
  const insets = useSafeAreaInsets();
  const { showToast, ToastComponent } = useToast();
  const [finalCashUsd, setFinalCashUsd] = useState('');
  const [finalCashVes, setFinalCashVes] = useState('');
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
    const cashUsd = parseFloat(finalCashUsd.replace(/,/g, '.'));
    const cashVes = parseFloat(finalCashVes.replace(/,/g, '.'));

    if (isNaN(cashUsd) || cashUsd < 0) {
      showToast('Por favor, informe um valor válido para o dinheiro final (USD)', 'error');
      return;
    }
    if (isNaN(cashVes) || cashVes < 0) {
      showToast('Por favor, informe um valor válido para o dinheiro final (Bs)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(cashUsd, cashVes, notes.trim() || undefined);
      // Reset form
      setFinalCashUsd('');
      setFinalCashVes('');
      setNotes('');
      setSummary(null);
    } catch (error: any) {
      showToast(error.message || 'Erro ao fechar turno', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cashUsdSales = summary?.cashUsdRevenue || 0;
  const cashVesSales = (summary?.cashVesRevenue || 0) * exchangeRate;
  const expectedCashUsd = initialCashUsd + cashUsdSales;
  const expectedCashVes = initialCashVes + cashVesSales;
  const finalCashUsdNum = parseFloat(finalCashUsd.replace(/,/g, '.'));
  const finalCashVesNum = parseFloat(finalCashVes.replace(/,/g, '.'));
  const discrepancyUsd = !isNaN(finalCashUsdNum) ? finalCashUsdNum - expectedCashUsd : 0;
  const discrepancyVes = !isNaN(finalCashVesNum) ? finalCashVesNum - expectedCashVes : 0;

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
                <View className="bg-bg-base rounded-2xl p-4 gap-3">
                  <Text className="font-display text-base text-text-primary mb-1">📊 Resumo de Vendas</Text>

                  <View className="flex-row justify-between items-center">
                    <Text className="font-sans text-sm text-text-muted">Total de vendas</Text>
                    <Text className="font-sans-bold text-sm text-text-primary">{summary.totalSales}</Text>
                  </View>

                  {/* Split revenue by currency */}
                  <View className="flex-row gap-2">
                    <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}>
                      <Text className="font-sans text-xs text-text-muted mb-1">Receita USD</Text>
                      <Text className="font-mono-bold text-base" style={{ color: '#10B981' }}>
                        ${summary.cashUsdRevenue.toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }}>
                      <Text className="font-sans text-xs text-text-muted mb-1">Receita Bs</Text>
                      <Text className="font-mono-bold text-base" style={{ color: '#3B82F6' }}>
                        Bs {((summary.cashVesRevenue + summary.debitRevenue + summary.creditRevenue + summary.pagoMovilRevenue + summary.transferRevenue) * exchangeRate).toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* USD Methods Group */}
                  {summary.cashUsdRevenue > 0 && (
                    <View className="rounded-xl p-3 gap-2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                      <Text className="font-sans-bold text-xs uppercase tracking-widest" style={{ color: '#10B981' }}>
                        💵 Métodos USD
                      </Text>
                      <View className="flex-row justify-between items-center">
                        <Text className="font-sans text-sm text-text-muted">Dinheiro</Text>
                        <Text className="font-mono text-sm" style={{ color: '#10B981' }}>
                          ${summary.cashUsdRevenue.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Bs Methods Group */}
                  {(summary.cashVesRevenue > 0 || summary.debitRevenue > 0 || summary.creditRevenue > 0 || summary.pagoMovilRevenue > 0 || summary.transferRevenue > 0) && (
                    <View className="rounded-xl p-3 gap-2" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                      <Text className="font-sans-bold text-xs uppercase tracking-widest" style={{ color: '#3B82F6' }}>
                        💵 Métodos Bs
                      </Text>
                      {summary.cashVesRevenue > 0 && (
                        <View className="flex-row justify-between items-center">
                          <Text className="font-sans text-sm text-text-muted">Dinheiro</Text>
                          <Text className="font-mono text-sm" style={{ color: '#3B82F6' }}>
                            Bs {(summary.cashVesRevenue * exchangeRate).toFixed(2)}
                          </Text>
                        </View>
                      )}
                      {summary.debitRevenue > 0 && (
                        <View className="flex-row justify-between items-center">
                          <Text className="font-sans text-sm text-text-muted">💳 Débito</Text>
                          <Text className="font-mono text-sm" style={{ color: '#3B82F6' }}>
                            Bs {(summary.debitRevenue * exchangeRate).toFixed(2)}
                          </Text>
                        </View>
                      )}
                      {summary.creditRevenue > 0 && (
                        <View className="flex-row justify-between items-center">
                          <Text className="font-sans text-sm text-text-muted">💳 Crédito</Text>
                          <Text className="font-mono text-sm" style={{ color: '#3B82F6' }}>
                            Bs {(summary.creditRevenue * exchangeRate).toFixed(2)}
                          </Text>
                        </View>
                      )}
                      {summary.pagoMovilRevenue > 0 && (
                        <View className="flex-row justify-between items-center">
                          <Text className="font-sans text-sm text-text-muted">📱 Pago Móvil</Text>
                          <Text className="font-mono text-sm" style={{ color: '#3B82F6' }}>
                            Bs {(summary.pagoMovilRevenue * exchangeRate).toFixed(2)}
                          </Text>
                        </View>
                      )}
                      {summary.transferRevenue > 0 && (
                        <View className="flex-row justify-between items-center">
                          <Text className="font-sans text-sm text-text-muted">🏦 Transferência</Text>
                          <Text className="font-mono text-sm" style={{ color: '#3B82F6' }}>
                            Bs {(summary.transferRevenue * exchangeRate).toFixed(2)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {summary.otherRevenue > 0 && (
                    <View className="flex-row justify-between items-center">
                      <Text className="font-sans text-sm text-text-muted">🔧 Outro</Text>
                      <Text className="font-mono text-sm text-text-primary">${summary.otherRevenue.toFixed(2)}</Text>
                    </View>
                  )}
                </View>

                {/* Cash Control USD */}
                <View className="rounded-2xl p-4 gap-3" style={{ backgroundColor: '#0F1520', borderWidth: 2, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  {/* Header with icon */}
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                      <Text className="text-2xl">💵</Text>
                    </View>
                    <Text className="font-display-bold text-lg" style={{ color: '#10B981' }}>Gaveta USD</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="font-sans text-sm text-text-muted">Dinheiro inicial</Text>
                    <Text className="font-mono text-sm" style={{ color: '#10B981' }}>${initialCashUsd.toFixed(2)}</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="font-sans text-sm text-text-muted">Vendas em dinheiro</Text>
                    <Text className="font-mono text-sm" style={{ color: '#10B981' }}>${cashUsdSales.toFixed(2)}</Text>
                  </View>

                  <View className="h-px my-1" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }} />

                  <View className="flex-row justify-between items-center">
                    <Text className="font-sans-bold text-sm" style={{ color: '#10B981' }}>Esperado na gaveta</Text>
                    <Text className="font-mono-bold text-xl" style={{ color: '#10B981' }}>${expectedCashUsd.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Cash Control VES */}
                <View className="rounded-2xl p-4 gap-3" style={{ backgroundColor: '#0F1520', borderWidth: 2, borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                  {/* Header with icon */}
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
                      <Text className="text-2xl">💵</Text>
                    </View>
                    <Text className="font-display-bold text-lg" style={{ color: '#3B82F6' }}>Gaveta Bolívares</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="font-sans text-sm text-text-muted">Dinheiro inicial</Text>
                    <Text className="font-mono text-sm" style={{ color: '#3B82F6' }}>Bs {initialCashVes.toFixed(2)}</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="font-sans text-sm text-text-muted">Vendas em dinheiro</Text>
                    <Text className="font-mono text-sm" style={{ color: '#3B82F6' }}>Bs {cashVesSales.toFixed(2)}</Text>
                  </View>

                  <View className="h-px my-1" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }} />

                  <View className="flex-row justify-between items-center">
                    <Text className="font-sans-bold text-sm" style={{ color: '#3B82F6' }}>Esperado na gaveta</Text>
                    <Text className="font-mono-bold text-xl" style={{ color: '#3B82F6' }}>Bs {expectedCashVes.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Final Cash Input USD */}
                <View className="gap-2">
                  <Text className="font-sans-bold text-xs uppercase tracking-widest" style={{ color: '#10B981' }}>
                    💵 Dinheiro contado (USD)
                  </Text>
                  <View className="flex-row items-center rounded-xl overflow-hidden" style={{ backgroundColor: '#0F1520', borderWidth: 2, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                    <View className="px-4" style={{ height: 56, justifyContent: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRightWidth: 1, borderRightColor: 'rgba(16, 185, 129, 0.3)' }}>
                      <Text className="font-sans-bold text-base" style={{ color: '#10B981' }}>$</Text>
                    </View>
                    <TextInput
                      className="flex-1 font-mono text-2xl px-4"
                      style={{ color: '#10B981', height: 56 }}
                      value={finalCashUsd}
                      onChangeText={(text) => setFinalCashUsd(text.replace(/[^0-9.,]/g, ''))}
                      placeholder="0.00"
                      placeholderTextColor="#6B7F95"
                      keyboardType="decimal-pad"
                      editable={!isSubmitting}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* Final Cash Input VES */}
                <View className="gap-2">
                  <Text className="font-sans-bold text-xs uppercase tracking-widest" style={{ color: '#3B82F6' }}>
                    💵 Dinheiro contado (Bs)
                  </Text>
                  <View className="flex-row items-center rounded-xl overflow-hidden" style={{ backgroundColor: '#0F1520', borderWidth: 2, borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    <View className="px-4" style={{ height: 56, justifyContent: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRightWidth: 1, borderRightColor: 'rgba(59, 130, 246, 0.3)' }}>
                      <Text className="font-sans-bold text-base" style={{ color: '#3B82F6' }}>Bs</Text>
                    </View>
                    <TextInput
                      className="flex-1 font-mono text-2xl px-4"
                      style={{ color: '#3B82F6', height: 56 }}
                      value={finalCashVes}
                      onChangeText={(text) => setFinalCashVes(text.replace(/[^0-9.,]/g, ''))}
                      placeholder="0.00"
                      placeholderTextColor="#6B7F95"
                      keyboardType="decimal-pad"
                      editable={!isSubmitting}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* Discrepancy Cards */}
                {!isNaN(finalCashUsdNum) && finalCashUsd !== '' && (
                  <View
                    className="rounded-2xl p-5 gap-2"
                    style={{
                      backgroundColor: '#080C12',
                      borderWidth: 3,
                      borderColor: Math.abs(discrepancyUsd) <= 0.01
                        ? '#10B981'
                        : discrepancyUsd > 0
                          ? '#10B981'
                          : '#FF3F5B',
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">Gaveta USD</Text>
                        <Text className="font-sans text-xs text-text-muted mt-1">
                          Esperado: ${expectedCashUsd.toFixed(2)}
                        </Text>
                        <Text className="font-sans text-xs text-text-muted">
                          Contado: ${finalCashUsdNum.toFixed(2)}
                        </Text>
                      </View>
                      {Math.abs(discrepancyUsd) <= 0.01 ? (
                        <Text className="text-5xl">✅</Text>
                      ) : (
                        <Text className="text-5xl">{discrepancyUsd > 0 ? '📈' : '⚠️'}</Text>
                      )}
                    </View>
                    <View className="items-center pt-2" style={{ borderTopWidth: 1, borderTopColor: 'rgba(107, 127, 149, 0.2)' }}>
                      <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">Diferença</Text>
                      <Text
                        className="font-mono-bold text-5xl mt-1"
                        style={{ color: discrepancyUsd < 0 ? '#FF3F5B' : '#10B981' }}
                      >
                        {discrepancyUsd > 0 && '+'}{discrepancyUsd.toFixed(2)}
                      </Text>
                      {Math.abs(discrepancyUsd) > 0.01 && (
                        <Text className="font-sans-bold text-sm mt-1" style={{ color: discrepancyUsd < 0 ? '#FF3F5B' : '#10B981' }}>
                          {discrepancyUsd > 0 ? 'Sobrou dinheiro' : 'Faltou dinheiro'}
                        </Text>
                      )}
                      {Math.abs(discrepancyUsd) <= 0.01 && (
                        <Text className="font-sans-bold text-sm" style={{ color: '#10B981' }}>
                          Correto!
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {!isNaN(finalCashVesNum) && finalCashVes !== '' && (
                  <View
                    className="rounded-2xl p-5 gap-2"
                    style={{
                      backgroundColor: '#080C12',
                      borderWidth: 3,
                      borderColor: Math.abs(discrepancyVes) <= 0.01
                        ? '#3B82F6'
                        : discrepancyVes > 0
                          ? '#3B82F6'
                          : '#FF3F5B',
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">Gaveta Bs</Text>
                        <Text className="font-sans text-xs text-text-muted mt-1">
                          Esperado: Bs {expectedCashVes.toFixed(2)}
                        </Text>
                        <Text className="font-sans text-xs text-text-muted">
                          Contado: Bs {finalCashVesNum.toFixed(2)}
                        </Text>
                      </View>
                      {Math.abs(discrepancyVes) <= 0.01 ? (
                        <Text className="text-5xl">✅</Text>
                      ) : (
                        <Text className="text-5xl">{discrepancyVes > 0 ? '📈' : '⚠️'}</Text>
                      )}
                    </View>
                    <View className="items-center pt-2" style={{ borderTopWidth: 1, borderTopColor: 'rgba(107, 127, 149, 0.2)' }}>
                      <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">Diferença</Text>
                      <Text
                        className="font-mono-bold text-5xl mt-1"
                        style={{ color: discrepancyVes < 0 ? '#FF3F5B' : '#3B82F6' }}
                      >
                        {discrepancyVes > 0 && '+'}{discrepancyVes.toFixed(2)}
                      </Text>
                      {Math.abs(discrepancyVes) > 0.01 && (
                        <Text className="font-sans-bold text-sm mt-1" style={{ color: discrepancyVes < 0 ? '#FF3F5B' : '#3B82F6' }}>
                          {discrepancyVes > 0 ? 'Sobrou dinheiro' : 'Faltou dinheiro'}
                        </Text>
                      )}
                      {Math.abs(discrepancyVes) <= 0.01 && (
                        <Text className="font-sans-bold text-sm" style={{ color: '#3B82F6' }}>
                          Correto!
                        </Text>
                      )}
                    </View>
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
