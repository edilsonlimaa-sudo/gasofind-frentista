import { getEnabledFuelTypes, type FuelTypeDB } from '@/database/repositories';
import { cn } from '@/lib/cn';
import type { FuelType } from '@/types/sales';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

// ============================================================================
// Fuel Type Selector
// ============================================================================

export interface FuelTypeSelectorProps {
  value: FuelType | null;
  onChange: (fuelType: FuelType) => void;
  disabled?: boolean;
  /**
   * If true, shows only enabled fuel types (default: true)
   * If false, shows all fuel types regardless of enabled status
   */
  showOnlyEnabled?: boolean;
  /**
   * If true, automatically selects the fuel type when there's only one option available (default: false)
   */
  autoSelectSingle?: boolean;
}

export function FuelTypeSelector({ 
  value, 
  onChange, 
  disabled,
  showOnlyEnabled = true,
  autoSelectSingle = false
}: FuelTypeSelectorProps) {
  const [fuelTypes, setFuelTypes] = useState<FuelTypeDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFuelTypes();
  }, [showOnlyEnabled]);

  // Auto-select when there's only one fuel type available
  useEffect(() => {
    if (autoSelectSingle && !value && fuelTypes.length === 1) {
      onChange(fuelTypes[0].code);
    }
  }, [fuelTypes, autoSelectSingle, value]);

  const loadFuelTypes = async () => {
    setIsLoading(true);
    try {
      const types = await getEnabledFuelTypes();
      setFuelTypes(types);
    } catch (error) {
      console.error('Error loading fuel types:', error);
      setFuelTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="py-8 items-center justify-center">
        <ActivityIndicator size="small" color="#666" />
        <Text className="text-text-muted text-sm mt-2">Carregando combustíveis...</Text>
      </View>
    );
  }

  if (fuelTypes.length === 0) {
    return (
      <View className="py-8 items-center justify-center bg-bg-surface rounded-2xl border border-bg-border">
        <Text className="text-text-muted text-sm">Nenhum combustível disponível</Text>
        <Text className="text-text-muted text-xs mt-1">
          Configure os combustíveis nas configurações
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {fuelTypes.map((type) => {
        const selected = value === type.code;
        return (
          <Pressable
            key={type.id}
            onPress={() => !disabled && onChange(type.code)}
            className={cn(
              'flex-row items-center gap-4 rounded-2xl p-4 border-2',
              selected ? 'bg-bg-border border-accent' : 'bg-bg-surface border-bg-border',
              disabled && 'opacity-40',
            )}
          >
            <Text style={{ fontSize: 36 }}>{type.emoji}</Text>
            <View className="flex-1">
              <Text className={cn('font-sans-bold text-base', selected ? 'text-accent' : 'text-text-primary')}>
                {type.name}
              </Text>
              <Text className="font-sans text-xs text-text-muted mt-0.5">{type.description}</Text>
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
