import { PriceInput } from '@/components/price-input';
import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { getSettings, saveSettings } from '@/services/settings';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  const { showToast, ToastComponent } = useToast();
  const [gasolinePrice, setGasolinePrice] = useState('');
  const [dieselPrice, setDieselPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setGasolinePrice(String(s.gasolinePrice));
      setDieselPrice(String(s.dieselPrice));
    });
  }, []);

  const handleSave = async () => {
    const gasPrice = parseFloat(gasolinePrice.replace(',', '.'));
    const dslPrice = parseFloat(dieselPrice.replace(',', '.'));

    if (isNaN(gasPrice) || gasPrice <= 0) {
      showToast('Informe um preço válido para Gasolina', 'error');
      return;
    }
    if (isNaN(dslPrice) || dslPrice <= 0) {
      showToast('Informe um preço válido para Diesel', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await saveSettings({ gasolinePrice: gasPrice, dieselPrice: dslPrice });
      showToast('Configurações salvas!', 'success');
      setTimeout(() => router.back(), 800);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showToast('Erro ao salvar configurações', 'error');
    } finally {
      setIsSaving(false);
    }
  };

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
          <View>
            <Text className="font-display-bold text-xl text-text-primary">Ajustes</Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Fuel price section */}
          <View className="gap-4">
            <View>
              <Text className="font-display-bold text-base text-text-primary mb-0.5">
                Preço do Combustível
              </Text>
              <Text className="font-sans text-sm text-text-muted">
                Preço padrão por litro (USD). Usado automaticamente em cada venda.
              </Text>
            </View>

            <View className="gap-2">
              <View className="flex-row items-center gap-2 mb-1">
                <Text style={{ fontSize: 18 }}>⛽</Text>
                <Text className="font-sans-bold text-sm text-text-muted uppercase tracking-widest">
                  Gasolina
                </Text>
              </View>
              <PriceInput value={gasolinePrice} onChange={setGasolinePrice} disabled={isSaving} />
            </View>

            <View className="gap-2">
              <View className="flex-row items-center gap-2 mb-1">
                <Text style={{ fontSize: 18 }}>🚛</Text>
                <Text className="font-sans-bold text-sm text-text-muted uppercase tracking-widest">
                  Diesel
                </Text>
              </View>
              <PriceInput value={dieselPrice} onChange={setDieselPrice} disabled={isSaving} />
            </View>
          </View>

          {/* Info box */}
          <View className="bg-bg-surface border border-bg-border rounded-2xl p-4 gap-2">
            <Text className="font-sans-bold text-sm text-text-primary">💡 Como funciona</Text>
            <Text className="font-sans text-sm text-text-muted leading-5">
              Ao registrar uma venda, o preço por litro é preenchido automaticamente com base
              no tipo de combustível selecionado. O frentista não precisa digitar o preço.
            </Text>
            <Text className="font-sans text-sm text-text-muted leading-5">
              A taxa do dia (Bs por $1) é informada ao abrir o turno e é usada para mostrar
              o equivalente em bolívares no total de cada venda.
            </Text>
          </View>
        </ScrollView>

        {/* Sticky save button */}
        <View className="px-4 py-3 border-t border-bg-border bg-bg-base">
          <Button onPress={handleSave} loading={isSaving} size="lg">
            Salvar Configurações
          </Button>
        </View>
      </KeyboardAvoidingView>

      {ToastComponent}
    </SafeAreaView>
  );
}
