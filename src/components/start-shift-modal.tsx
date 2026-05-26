import { Button } from '@/components/ui/button';
import { getDailyExchangeRate, saveDailyExchangeRate } from '@/services/settings';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface StartShiftModalProps {
  visible: boolean;
  onConfirm: (operatorName: string, initialCash: number, exchangeRate: number) => Promise<void>;
  onCancel: () => void;
}

export function StartShiftModal({ visible, onConfirm, onCancel }: StartShiftModalProps) {
  const insets = useSafeAreaInsets();
  const [operatorName, setOperatorName] = useState('');
  const [initialCash, setInitialCash] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [isCachedRate, setIsCachedRate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill exchange rate from today's cache when modal opens
  useEffect(() => {
    if (!visible) return;
    getDailyExchangeRate().then((cached) => {
      if (cached !== null) {
        setExchangeRate(String(cached));
        setIsCachedRate(true);
      } else {
        setExchangeRate('');
        setIsCachedRate(false);
      }
    });
  }, [visible]);

  const handleConfirm = async () => {
    const name = operatorName.trim();
    const cash = parseFloat(initialCash.replace(',', '.'));
    const rate = parseFloat(exchangeRate.replace(',', '.'));

    if (!name) {
      alert('Por favor, informe seu nome');
      return;
    }
    if (isNaN(cash) || cash < 0) {
      alert('Por favor, informe um valor válido para o dinheiro inicial');
      return;
    }
    if (!exchangeRate || isNaN(rate) || rate <= 0) {
      alert('Por favor, informe a taxa do dia (Bs por $1)');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveDailyExchangeRate(rate);
      await onConfirm(name, cash, rate);
      setOperatorName('');
      setInitialCash('');
      setExchangeRate('');
      setIsCachedRate(false);
    } catch (error: any) {
      alert(error.message || 'Erro ao iniciar turno');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <View className="bg-bg-surface rounded-t-3xl px-6 pt-6 gap-5" style={{ paddingBottom: insets.bottom + 24 }}>
          {/* Handle bar */}
          <View className="w-10 h-1 bg-bg-border rounded-full self-center mb-1" />

          <Text className="font-display-bold text-2xl text-text-primary">Iniciar Turno</Text>

          <View className="gap-2">
            <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
              Seu nome
            </Text>
            <TextInput
              className="bg-bg-base border border-bg-border rounded-xl px-4 text-text-primary font-sans text-base"
              value={operatorName}
              onChangeText={setOperatorName}
              placeholder="Ex: João Silva"
              placeholderTextColor="#6B7F95"
              editable={!isSubmitting}
              autoCapitalize="words"
              returnKeyType="next"
              style={{ height: 56 }}
            />
          </View>

          <View className="gap-2">
            <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
              Dinheiro inicial na gaveta (USD)
            </Text>
            <View className="flex-row items-center bg-bg-base border border-bg-border rounded-xl overflow-hidden">
              <View className="px-4 border-r border-bg-border bg-bg-border" style={{ height: 56, justifyContent: 'center' }}>
                <Text className="font-sans-bold text-text-muted text-base">$</Text>
              </View>
              <TextInput
                className="flex-1 font-mono text-text-primary text-2xl px-4"
                value={initialCash}
                onChangeText={(text) => setInitialCash(text.replace(/[^0-9.,]/g, ''))}
                placeholder="0.00"
                placeholderTextColor="#6B7F95"
                keyboardType="decimal-pad"
                editable={!isSubmitting}
                returnKeyType="next"
                style={{ height: 56 }}
              />
            </View>
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
                Taxa do dia (Bs por $1)
              </Text>
              {isCachedRate && (
                <Text className="font-sans text-xs text-status-green">de hoje ✓</Text>
              )}
            </View>
            <View className="flex-row items-center bg-bg-base border border-bg-border rounded-xl overflow-hidden">
              <View className="px-4 border-r border-bg-border bg-bg-border" style={{ height: 56, justifyContent: 'center' }}>
                <Text className="font-sans-bold text-text-muted text-base">Bs</Text>
              </View>
              <TextInput
                className="flex-1 font-mono text-text-primary text-2xl px-4"
                value={exchangeRate}
                onChangeText={(text) => {
                  setExchangeRate(text.replace(/[^0-9.,]/g, ''));
                  setIsCachedRate(false);
                }}
                placeholder="Ex: 60"
                placeholderTextColor="#6B7F95"
                keyboardType="decimal-pad"
                editable={!isSubmitting}
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
                style={{ height: 56 }}
              />
            </View>
          </View>

          <View className="flex-row gap-3 mt-2">
            <Button variant="secondary" onPress={onCancel} disabled={isSubmitting} className="flex-1">
              Cancelar
            </Button>
            <Button onPress={handleConfirm} loading={isSubmitting} className="flex-1">
              Iniciar Turno
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
