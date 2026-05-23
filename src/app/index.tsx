import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FuelTypeSelector } from '@/components/fuel-type-selector';
import { PriceInput } from '@/components/price-input';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { updateFuelStatus } from '@/services/stations.service';
import type { FuelType } from '@/types/station';

export default function HomeScreen() {
  const { frentista, logout } = useAuth();

  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [priceText, setPriceText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function parsePrice(text: string): number {
    return parseFloat(text.replace(',', '.'));
  }

  async function handleSubmit() {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!selectedFuel) {
      setErrorMessage('Selecione o tipo de combustível.');
      return;
    }

    const price = parsePrice(priceText);
    if (!priceText || isNaN(price) || price <= 0) {
      setErrorMessage('Informe um preço válido.');
      return;
    }

    if (!frentista) return;

    setIsSubmitting(true);
    try {
      await updateFuelStatus({
        stationId: frentista.stationId,
        fuelType: selectedFuel,
        price,
      });
      setSuccessMessage('Preço atualizado com sucesso!');
      setSelectedFuel(null);
      setPriceText('');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setErrorMessage(msg ?? 'Erro ao atualizar preço. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = !isSubmitting && selectedFuel !== null && priceText.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Gasofind</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {frentista?.name ?? ''}
            </Text>
          </View>
          <Pressable onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        {/* Station info */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Seu posto</Text>
          <Text style={styles.cardValue}>{frentista?.stationId}</Text>
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tipo de combustível</Text>
          <FuelTypeSelector value={selectedFuel} onChange={setSelectedFuel} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preço por litro</Text>
          <PriceInput value={priceText} onChange={setPriceText} />
        </View>

        {/* Feedback messages */}
        {successMessage && (
          <View style={styles.messageSuccess}>
            <Text style={styles.messageText}>{successMessage}</Text>
          </View>
        )}
        {errorMessage && (
          <View style={styles.messageError}>
            <Text style={styles.messageText}>{errorMessage}</Text>
          </View>
        )}

        {/* Submit */}
        <Pressable
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}>
          {isSubmitting ? (
            <ActivityIndicator color={Colors.bgBase} />
          ) : (
            <Text style={styles.submitText}>Confirmar</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  container: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  appName: {
    fontFamily: Fonts.displayBold,
    fontSize: 24,
    color: Colors.accent,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  logoutText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 12,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    gap: Spacing.one,
  },
  cardLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardValue: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  messageSuccess: {
    backgroundColor: '#052e16',
    borderRadius: 8,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.statusGreen,
  },
  messageError: {
    backgroundColor: '#2d0a0a',
    borderRadius: 8,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.statusRed,
  },
  messageText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  submitButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    color: Colors.bgBase,
  },
});
