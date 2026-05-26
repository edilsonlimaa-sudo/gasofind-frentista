import { cn } from '@/lib/cn';
import type { FuelType } from '@/types/sales';
import { FuelTypeLabels } from '@/types/sales';
import { Pressable, Text, View } from 'react-native';

// ============================================================================
// Fuel Type Selector
// ============================================================================

export interface FuelTypeSelectorProps {
  value: FuelType | null;
  onChange: (fuelType: FuelType) => void;
  disabled?: boolean;
}

const FUEL_CONFIG: Record<FuelType, { emoji: string; description: string }> = {
  gasoline: { emoji: '⛽', description: 'Premium 87 / 91 octanos' },
  diesel: { emoji: '🚛', description: 'Para caminhões e maquinaria' },
};

export function FuelTypeSelector({ value, onChange, disabled }: FuelTypeSelectorProps) {
  return (
    <View className="gap-3">
      {(Object.keys(FUEL_CONFIG) as FuelType[]).map((type) => {
        const selected = value === type;
        const { emoji, description } = FUEL_CONFIG[type];
        return (
          <Pressable
            key={type}
            onPress={() => !disabled && onChange(type)}
            className={cn(
              'flex-row items-center gap-4 rounded-2xl p-4 border-2',
              selected ? 'bg-bg-border border-accent' : 'bg-bg-surface border-bg-border',
              disabled && 'opacity-40',
            )}
          >
            <Text style={{ fontSize: 36 }}>{emoji}</Text>
            <View className="flex-1">
              <Text className={cn('font-sans-bold text-base', selected ? 'text-accent' : 'text-text-primary')}>
                {FuelTypeLabels[type]}
              </Text>
              <Text className="font-sans text-xs text-text-muted mt-0.5">{description}</Text>
            </View>
            {selected && (
              <View className="w-5 h-5 rounded-full bg-accent items-center justify-center">
                <Text className="text-bg-base text-xs font-sans-bold">✓</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
