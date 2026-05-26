import { SaleCard } from '@/components/sale-card';
import { Card } from '@/components/ui/card';
import { useShift } from '@/contexts/shift-context';
import { getSales, getSalesSummary } from '@/database/repositories';
import type { Sale, SalesSummary } from '@/types/sales';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAYMENT_ITEMS: Array<{ key: keyof SalesSummary; emoji: string; label: string }> = [
  { key: 'cashRevenue', emoji: '💵', label: 'Dinheiro' },
  { key: 'debitRevenue', emoji: '💳', label: 'Débito' },
  { key: 'creditRevenue', emoji: '💳', label: 'Crédito' },
  { key: 'transferRevenue', emoji: '🏦', label: 'Transf.' },
  { key: 'otherRevenue', emoji: '📱', label: 'Outros' },
];

export default function History() {
  const { currentShift } = useShift();
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentShift) {
      setSales([]);
      setSummary(null);
      return;
    }

    try {
      const [salesData, summaryData] = await Promise.all([
        getSales(currentShift.id),
        getSalesSummary(currentShift.id),
      ]);
      setSales(salesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }, [currentShift]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  if (!currentShift) {
    return (
      <SafeAreaView className="flex-1 bg-bg-base">
        <View className="flex-1 items-center justify-center p-8">
          <Text className="font-display-bold text-xl text-text-primary mb-2">Nenhum turno ativo</Text>
          <Text className="font-sans text-sm text-text-muted text-center">
            Inicie um turno para ver o histórico de vendas
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const ListHeader = (
    <View className="gap-4 mb-3">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="font-display-bold text-3xl text-text-primary">Histórico</Text>
          <Text className="font-sans text-sm text-text-muted mt-0.5">Vendas do turno atual</Text>
        </View>
        <Pressable
          className="bg-bg-surface border border-bg-border rounded-xl px-3 py-2"
          onPress={() => router.back()}
        >
          <Text className="font-sans-bold text-sm text-text-primary">← Voltar</Text>
        </Pressable>
      </View>

      {summary && summary.totalSales > 0 && (
        <Card className="gap-4">
          <View className="flex-row gap-2">
            {[
              { label: 'Vendas', value: String(summary.totalSales) },
              { label: 'Litros', value: `${summary.totalLiters.toFixed(1)}L` },
              { label: 'Receita', value: `$${summary.totalRevenue.toFixed(2)}` },
            ].map(({ label, value }) => (
              <View key={label} className="flex-1 items-center bg-bg-border rounded-xl p-3">
                <Text className="font-mono-bold text-xl text-accent">{value}</Text>
                <Text className="font-sans text-xs text-text-muted mt-0.5">{label}</Text>
              </View>
            ))}
          </View>
          <View className="border-t border-bg-border pt-4 gap-2.5">
            {PAYMENT_ITEMS.filter(({ key }) => (summary[key] as number) > 0).map(({ key, emoji, label }) => {
              const amount = summary[key] as number;
              const pct = summary.totalRevenue > 0 ? amount / summary.totalRevenue : 0;
              return (
                <View key={key} className="flex-row items-center gap-3">
                  <Text style={{ fontSize: 16, width: 24 }}>{emoji}</Text>
                  <Text className="font-sans text-sm text-text-muted" style={{ width: 72 }}>{label}</Text>
                  <View className="flex-1 h-1.5 bg-bg-border rounded-full overflow-hidden">
                    <View
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${(pct * 100).toFixed(0)}%` }}
                    />
                  </View>
                  <Text className="font-mono-bold text-sm text-text-primary" style={{ width: 72, textAlign: 'right' }}>
                    ${amount.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {sales.length > 0 && (
        <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
          {sales.length} venda{sales.length !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SaleCard sale={item} exchangeRate={currentShift.exchangeRate} />}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#00B8D9"
            colors={['#00B8D9']}
          />
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="font-display-bold text-lg text-text-muted mb-2">
              Nenhuma venda registrada
            </Text>
            <Text className="font-sans text-sm text-text-muted text-center">
              {'As vendas aparecerão aqui\nassim que forem registradas'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
