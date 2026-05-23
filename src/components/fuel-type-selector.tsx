import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import { FuelType, FuelTypeLabels } from '@/types/station';

const FUEL_TYPES: FuelType[] = ['gasoline', 'ethanol', 'diesel', 'diesel_s10'];

type Props = {
  value: FuelType | null;
  onChange: (type: FuelType) => void;
};

export function FuelTypeSelector({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {FUEL_TYPES.map((type) => {
        const selected = value === type;
        return (
          <Pressable
            key={type}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => onChange(type)}>
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {FuelTypeLabels[type]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  option: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    backgroundColor: Colors.bgSurface,
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.bgBorder,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.textMuted,
  },
  labelSelected: {
    color: Colors.accent,
  },
});
