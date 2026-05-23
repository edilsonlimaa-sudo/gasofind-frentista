import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function PriceInput({ value, onChange }: Props) {
  function handleChange(text: string) {
    // Allow only digits and a single comma or dot
    const cleaned = text.replace(/[^0-9.,]/g, '');
    onChange(cleaned);
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.prefix}>
        <Text style={styles.prefixText}>R$</Text>
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        keyboardType="decimal-pad"
        placeholder="0,00"
        placeholderTextColor={Colors.textMuted}
        maxLength={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    backgroundColor: Colors.bgBorder,
  },
  prefixText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.textMuted,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontFamily: Fonts.sansBold,
    fontSize: 22,
    color: Colors.textPrimary,
  },
});
