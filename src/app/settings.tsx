import { FuelTypeManager } from '@/components/fuel-type-manager';
import { useToast } from '@/components/toast';
import type { FuelTypeDB } from '@/database/repositories';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  const { ToastComponent } = useToast();

  const handleAddNew = () => {
    router.push('/fuel-type-form');
  };

  const handleEdit = (fuelType: FuelTypeDB) => {
    router.push(`/fuel-type-form?id=${fuelType.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
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
        contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 24 }}
      >
        {/* Fuel types management section */}
        <View className="gap-4">
          <View>
            <Text className="font-display-bold text-base text-text-primary mb-0.5">
              Gestão de Combustíveis
            </Text>
            <Text className="font-sans text-sm text-text-muted">
              Configure os tipos de combustível disponíveis, seus preços e disponibilidade.
            </Text>
          </View>

          <FuelTypeManager 
            onAddNew={handleAddNew}
            onEdit={handleEdit}
          />
        </View>
      </ScrollView>

      {ToastComponent}
    </SafeAreaView>
  );
}