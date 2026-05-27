import { CloseShiftModal } from '@/components/close-shift-modal';
import { SaleCard } from '@/components/sale-card';
import { ShiftSummaryCard } from '@/components/shift-summary-card';
import { StartShiftModal } from '@/components/start-shift-modal';
import { StationStatusWidget } from '@/components/station-status-widget';
import { StatusUpdateModal } from '@/components/status-update-modal';
import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useShift } from '@/contexts/shift-context';
import { getSales, getSalesSummary, getStationStatus } from '@/database/repositories';
import type { Sale, SalesSummary } from '@/types/sales';
import type { StationStatusRecord } from '@/types/station-status';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const { currentShift, isLoadingShift, startNewShift, endShift } = useShift();
  const { showToast, ToastComponent } = useToast();
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showStatusAfterOpen, setShowStatusAfterOpen] = useState(false);
  const [showStatusAfterClose, setShowStatusAfterClose] = useState(false);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [stationStatus, setStationStatus] = useState<StationStatusRecord | null>(null);

  useFocusEffect(
    useCallback(() => {
      // Always load station status (independent of shift)
      let cancelled = false;
      getStationStatus().then((s) => {
        if (!cancelled) setStationStatus(s);
      });

      if (!currentShift) {
        setSummary(null);
        setRecentSales([]);
        return () => { cancelled = true; };
      }

      (async () => {
        try {
          const [summaryData, salesData] = await Promise.all([
            getSalesSummary(currentShift.id),
            getSales(currentShift.id),
          ]);
          if (!cancelled) {
            setSummary(summaryData);
            setRecentSales(salesData.slice(0, 5));
          }
        } catch (error) {
          console.error('Error loading dashboard:', error);
        }
      })();
      return () => { cancelled = true; };
    }, [currentShift])
  );

  const handleStartShift = async (operatorName: string, initialCash: number, exchangeRate: number) => {
    try {
      await startNewShift(operatorName, initialCash, exchangeRate);
      setShowStartModal(false);
      showToast('Turno iniciado com sucesso!', 'success');
      setShowStatusAfterOpen(true);
    } catch (error: any) {
      throw error;
    }
  };

  const handleCloseShift = async (finalCash: number, notes?: string) => {
    try {
      await endShift(finalCash, notes);
      setShowCloseModal(false);
      showToast('Turno fechado com sucesso!', 'success');
      setShowStatusAfterClose(true);
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 flex-row items-start justify-between border-b border-bg-border">
        <View>
          <Text className="font-display-bold text-3xl text-accent">GasoFind</Text>
          <Text className="font-sans text-sm text-text-muted mt-0.5">Controle de Vendas</Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            className="bg-bg-surface border border-bg-border rounded-xl px-3 py-2"
            onPress={() => router.push('/settings')}
          >
            <Text className="font-sans-bold text-sm text-text-primary">⚙️ Ajustes</Text>
          </Pressable>
          {currentShift && (
            <Pressable
              className="bg-bg-surface border border-bg-border rounded-xl px-3 py-2"
              onPress={() => router.push('/history')}
            >
              <Text className="font-sans-bold text-sm text-text-primary">📋 Histórico</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 8 }}
      >
        {/* Station status widget — always visible */}
        <StationStatusWidget
          status={stationStatus}
          onPress={() => router.push('/crowd-control')}
        />

        {/* No active shift */}
        {!currentShift && !isLoadingShift && (
          <Card className="items-center py-8">
            <Text className="font-display-bold text-xl text-text-primary mb-2">
              Nenhum turno ativo
            </Text>
            <Text className="font-sans text-sm text-text-muted text-center mb-6">
              Inicie um turno para começar a{'\n'}registrar vendas
            </Text>
            <Button onPress={() => setShowStartModal(true)} size="lg" className="w-full">
              Iniciar Turno
            </Button>
          </Card>
        )}

        {/* Active shift dashboard */}
        {currentShift && (
          <>
            <ShiftSummaryCard shift={currentShift} onClose={() => setShowCloseModal(true)} />

            {/* Metrics row */}
            {summary && (
              <View className="flex-row gap-3">
                <View className="flex-1 bg-bg-surface border border-bg-border rounded-2xl p-3 items-center">
                  <Text className="font-mono-bold text-2xl text-text-primary">{summary.totalSales}</Text>
                  <Text className="font-sans text-xs text-text-muted mt-1">Vendas</Text>
                </View>
                <View className="flex-1 bg-bg-surface border border-bg-border rounded-2xl p-3 items-center">
                  <Text className="font-mono-bold text-2xl text-accent">${summary.totalRevenue.toFixed(0)}</Text>
                  <Text className="font-sans text-xs text-text-muted mt-1">Receita</Text>
                </View>
                <View className="flex-1 bg-bg-surface border border-bg-border rounded-2xl p-3 items-center">
                  <Text className="font-mono-bold text-2xl text-status-green">${summary.cashRevenue.toFixed(0)}</Text>
                  <Text className="font-sans text-xs text-text-muted mt-1">Dinheiro</Text>
                </View>
              </View>
            )}

            {/* Recent sales */}
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-display-bold text-base text-text-primary">Últimas vendas</Text>
                {recentSales.length > 0 && (
                  <Pressable onPress={() => router.push('/history')}>
                    <Text className="font-sans-bold text-sm text-accent">Ver tudo →</Text>
                  </Pressable>
                )}
              </View>
              {recentSales.length === 0 ? (
                <View className="bg-bg-surface border border-bg-border rounded-2xl p-6 items-center">
                  <Text className="font-sans text-sm text-text-muted text-center">
                    Nenhuma venda ainda.{'\n'}Toque em Registrar Venda para começar.
                  </Text>
                </View>
              ) : (
                <View className="gap-2">
                  {recentSales.map((sale) => (
                    <SaleCard key={sale.id} sale={sale} exchangeRate={currentShift.exchangeRate} />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      {currentShift && (
        <View className="px-4 py-3 border-t border-bg-border bg-bg-base">
          <Button onPress={() => router.push('/sale')} size="lg">
            + Registrar Venda
          </Button>
        </View>
      )}

      <StartShiftModal
        visible={showStartModal}
        onConfirm={handleStartShift}
        onCancel={() => setShowStartModal(false)}
      />

      {currentShift && (
        <CloseShiftModal
          visible={showCloseModal}
          shiftId={currentShift.id}
          initialCash={currentShift.initialCash}
          onConfirm={handleCloseShift}
          onCancel={() => setShowCloseModal(false)}
        />
      )}

      <StatusUpdateModal
        visible={showStatusAfterOpen}
        mode="after_open"
        onConfirm={(record) => {
          setStationStatus(record);
          setShowStatusAfterOpen(false);
        }}
        onDismiss={() => setShowStatusAfterOpen(false)}
      />

      <StatusUpdateModal
        visible={showStatusAfterClose}
        mode="after_close"
        onConfirm={(record) => {
          setStationStatus(record);
          setShowStatusAfterClose(false);
        }}
        onDismiss={() => setShowStatusAfterClose(false)}
      />

      {ToastComponent}
    </SafeAreaView>
  );
}
