import { EmojiPickerBottomSheet } from '@/components/emoji-picker-bottom-sheet';
import { PriceInput } from '@/components/price-input';
import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    createCustomFuelType,
    getFuelTypeById,
    updateFuelType,
} from '@/database/repositories';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ============================================================================
// Fuel Type Form Screen
// ============================================================================

export default function FuelTypeForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { showToast, ToastComponent } = useToast();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDefaultType, setIsDefaultType] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isEditMode = !!id;

  // Load existing fuel type data in edit mode
  useEffect(() => {
    async function loadFuelType() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        const fuelType = await getFuelTypeById(id);
        if (fuelType) {
          setName(fuelType.name);
          setEmoji(fuelType.emoji);
          setDescription(fuelType.description);
          setPrice(String(fuelType.pricePerLiter));
          setIsDefaultType(fuelType.isDefault === 1);
        } else {
          showToast('Combustível não encontrado', 'error');
          router.back();
        }
      } catch (error) {
        console.error('Error loading fuel type:', error);
        showToast('Erro ao carregar combustível', 'error');
        router.back();
      } finally {
        setIsLoading(false);
      }
    }

    loadFuelType();
  }, [id]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const priceNum = parseFloat(price.replace(',', '.'));
    // Use default emoji if none selected
    const finalEmoji = emoji.trim() || '⚡';

    // Validations
    if (!trimmedName) {
      showToast('Informe o nome do combustível', 'error');
      return;
    }
    if (!trimmedDescription) {
      showToast('Informe uma descrição', 'error');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      showToast('Informe um preço válido', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        // Update existing fuel type
        await updateFuelType(id, {
          name: trimmedName,
          emoji: finalEmoji,
          description: trimmedDescription,
          pricePerLiter: priceNum,
        });
        showToast('Combustível atualizado!', 'success');
      } else {
        // Create new custom fuel type (code is auto-generated from name)
        await createCustomFuelType({
          name: trimmedName,
          emoji: finalEmoji,
          description: trimmedDescription,
          pricePerLiter: priceNum,
          enabled: true, // New fuel types are enabled by default
        });
        showToast('Combustível criado!', 'success');
      }

      router.back();
    } catch (error: any) {
      console.error('Error saving fuel type:', error);
      showToast(error.message || 'Erro ao salvar combustível', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-base">
        <View className="flex-1 items-center justify-center">
          <Text className="font-sans text-text-muted">Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 flex-row items-center gap-3 border-b border-bg-border">
        <Pressable
          className="w-10 h-10 rounded-xl bg-bg-surface border border-bg-border items-center justify-center"
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <Text className="text-text-primary text-xl">←</Text>
        </Pressable>
        <View>
          <Text className="font-display-bold text-xl text-text-primary">
            {isEditMode ? 'Editar Combustível' : 'Novo Combustível'}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name field */}
        <View className="gap-2">
          <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
            Nome
          </Text>
          <TextInput
            className="bg-bg-surface border border-bg-border rounded-xl px-4 text-text-primary font-sans text-base"
            value={name}
            onChangeText={setName}
            placeholder="Ex: GLP, Gasolina Premium"
            placeholderTextColor="#6B7F95"
            editable={!isSubmitting}
            autoCapitalize="words"
            returnKeyType="next"
            style={{ height: 56 }}
          />
        </View>

        {/* Emoji selector */}
        <View className="gap-2">
          <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
            Emoji (ícone visual)
          </Text>

          <Pressable
            className="bg-bg-surface border border-bg-border rounded-xl flex-row items-center gap-4 px-4"
            style={{ height: 64 }}
            onPress={() => setShowEmojiPicker(true)}
            disabled={isSubmitting}
          >
            <Text style={{ fontSize: 32 }}>{emoji || '⚡'}</Text>
            <View className="flex-1">
              <Text className="font-sans text-sm text-text-primary">
                {emoji ? 'Trocar emoji' : 'Selecionar emoji'}
              </Text>
              <Text className="font-sans text-xs text-text-muted">
                Toque para {emoji ? 'alterar' : 'escolher'}
              </Text>
            </View>
            <Text className="text-text-muted text-xl">›</Text>
          </Pressable>

          <Text className="font-sans text-xs text-text-muted -mt-1">
            Opcional, padrão: ⚡
          </Text>
        </View>

        {/* Description field */}
        <View className="gap-2">
          <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
            Descrição
          </Text>
          <TextInput
            className="bg-bg-surface border border-bg-border rounded-xl px-4 text-text-primary font-sans text-base"
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Combustível comprimido para veículos adaptados"
            placeholderTextColor="#6B7F95"
            editable={!isSubmitting}
            multiline
            numberOfLines={2}
            returnKeyType="next"
            style={{ minHeight: 72, paddingTop: 16, paddingBottom: 16 }}
          />
        </View>

        {/* Price field */}
        <View className="gap-2">
          <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
            Preço por litro (USD)
          </Text>
          <PriceInput
            value={price}
            onChange={setPrice}
            disabled={isSubmitting}
          />
        </View>

        {/* Info for default types */}
        {isDefaultType && (
          <View className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3">
            <Text className="font-sans text-xs text-amber-200">
              ⚠️ Este é um combustível padrão. Você pode editar o nome, emoji, descrição
              e preço, mas não pode deletá-lo.
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View className="flex-row gap-3 pt-2">
          <Button
            onPress={() => router.back()}
            variant="secondary"
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onPress={handleSubmit}
            loading={isSubmitting}
            className="flex-1"
          >
            {isEditMode ? 'Salvar' : 'Criar'}
          </Button>
        </View>
      </ScrollView>

      <EmojiPickerBottomSheet
        visible={showEmojiPicker}
        selectedEmoji={emoji}
        onSelect={setEmoji}
        onClose={() => setShowEmojiPicker(false)}
      />

      {ToastComponent}
    </SafeAreaView>
  );
}
