import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    deleteFuelType,
    getFuelTypes,
    updateFuelType,
    type FuelTypeDB
} from '@/database/repositories';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Switch, Text, View } from 'react-native';

// ============================================================================
// Fuel Type Manager
// ============================================================================

export interface FuelTypeManagerProps {
  onAddNew?: () => void;
  onEdit?: (fuelType: FuelTypeDB) => void;
}

export function FuelTypeManager({ onAddNew, onEdit }: FuelTypeManagerProps) {
  const { showToast, ToastComponent } = useToast();
  const [fuelTypes, setFuelTypes] = useState<FuelTypeDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadFuelTypes();
  }, []);

  // Refresh when screen comes into focus (e.g., returning from form screen)
  useFocusEffect(
    useCallback(() => {
      loadFuelTypes(false); // Don't show loading spinner on refresh
    }, [])
  );

  const loadFuelTypes = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const types = await getFuelTypes();
      setFuelTypes(types);
    } catch (error) {
      console.error('Error loading fuel types:', error);
      showToast('Erro ao carregar combustíveis', 'error');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleToggleEnabled = async (id: string, currentEnabled: boolean) => {
    // Business rule: prevent disabling the last enabled fuel type
    if (currentEnabled) {
      const enabledCount = fuelTypes.filter((ft) => ft.enabled === 1).length;
      if (enabledCount === 1) {
        showToast(
          'Não é possível desabilitar todos os combustíveis. Mantenha pelo menos um ativo.',
          'error'
        );
        return;
      }
    }

    // Optimistic update: update local state immediately
    setFuelTypes((prev) =>
      prev.map((ft) =>
        ft.id === id ? { ...ft, enabled: currentEnabled ? 0 : 1 } : ft
      )
    );

    setUpdatingId(id);
    try {
      await updateFuelType(id, { enabled: !currentEnabled });
      showToast(
        currentEnabled ? 'Combustível desabilitado' : 'Combustível habilitado',
        'success'
      );
    } catch (error: any) {
      console.error('Error toggling fuel type:', error);
      showToast('Erro ao atualizar combustível', 'error');
      // Revert on error: reload from database
      await loadFuelTypes(false);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = (fuelType: FuelTypeDB) => {
    if (fuelType.isDefault === 1) {
      showToast('Não é possível deletar combustíveis padrão', 'error');
      return;
    }

    Alert.alert(
      'Deletar Combustível',
      `Tem certeza que deseja deletar "${fuelType.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFuelType(fuelType.id);
              // Optimistic update: remove from local state
              setFuelTypes((prev) => prev.filter((ft) => ft.id !== fuelType.id));
              showToast('Combustível deletado', 'success');
            } catch (error: any) {
              console.error('Error deleting fuel type:', error);
              showToast(error.message || 'Erro ao deletar combustível', 'error');
              // Reload on error
              await loadFuelTypes(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="py-8 items-center justify-center">
        <ActivityIndicator size="small" color="#666" />
        <Text className="text-text-muted text-sm mt-2">Carregando combustíveis...</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {/* Fuel types list */}
      <View className="gap-3">
        {fuelTypes.map((fuelType) => {
          const isUpdating = updatingId === fuelType.id;
          const isDefault = fuelType.isDefault === 1;
          const isEnabled = fuelType.enabled === 1;

          return (
            <View
              key={fuelType.id}
              className="bg-bg-surface border border-bg-border rounded-2xl p-4"
            >
              {/* Header row: emoji, name, price, toggle */}
              <View className="flex-row items-center gap-3 mb-2">
                <Text style={{ fontSize: 32 }}>{fuelType.emoji}</Text>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-sans-bold text-base text-text-primary">
                      {fuelType.name}
                    </Text>
                    {isDefault && (
                      <View className="bg-bg-border rounded px-2 py-0.5">
                        <Text className="font-sans text-xs text-text-muted">padrão</Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-mono text-sm text-text-muted mt-0.5">
                    ${fuelType.pricePerLiter.toFixed(2)}/L
                  </Text>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={() => handleToggleEnabled(fuelType.id, isEnabled)}
                  disabled={isUpdating}
                  trackColor={{ false: '#444', true: '#10b981' }}
                  thumbColor={isEnabled ? '#fff' : '#888'}
                />
              </View>

              {/* Description */}
              <Text className="font-sans text-sm text-text-muted mb-3">
                {fuelType.description}
              </Text>

              {/* Action buttons */}
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => onEdit?.(fuelType)}
                  disabled={isUpdating}
                  className="flex-1 bg-bg-base border border-bg-border rounded-xl py-2.5 items-center"
                >
                  <Text className="font-sans-bold text-sm text-text-primary">
                    ✏️ Editar
                  </Text>
                </Pressable>

                {!isDefault && (
                  <Pressable
                    onPress={() => handleDelete(fuelType)}
                    disabled={isUpdating}
                    className="bg-bg-base border border-bg-border rounded-xl px-4 py-2.5 items-center"
                  >
                    <Text className="font-sans-bold text-sm text-red-500">
                      🗑️
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Add new button */}
      {onAddNew && (
        <Button onPress={onAddNew} variant="secondary">
          ➕ Adicionar Novo Combustível
        </Button>
      )}

      {/* Info box */}
      <View className="bg-bg-surface border border-bg-border rounded-2xl p-4 gap-2">
        <Text className="font-sans-bold text-sm text-text-primary">💡 Como funciona</Text>
        <Text className="font-sans text-sm text-text-muted leading-5">
          Use o toggle para habilitar ou desabilitar um combustível. Apenas combustíveis 
          habilitados aparecem na tela de vendas.
        </Text>
        <Text className="font-sans text-sm text-text-muted leading-5">
          Os combustíveis padrão (Gasolina e Diesel) não podem ser deletados, mas você 
          pode adicionar novos tipos customizados.
        </Text>
      </View>

      {ToastComponent}
    </View>
  );
}
