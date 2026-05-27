import { PriceInput } from '@/components/price-input';
import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    createCustomFuelType,
    updateFuelType,
    type FuelTypeDB
} from '@/database/repositories';
import { cn } from '@/lib/cn';
import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ============================================================================
// Emoji Options for Fuel Types (Organized by Category)
// ============================================================================

type EmojiCategory = 'liquidos' | 'gases' | 'premium' | 'veiculos' | 'cores';

const FUEL_EMOJI_CATEGORIES: Record<EmojiCategory, { label: string; emojis: string[] }> = {
  liquidos: {
    label: 'Líquidos',
    emojis: ['💧', '🛢️', '⚡', '🌊', '💦'],
  },
  gases: {
    label: 'Gases',
    emojis: ['💨', '♨️', '🌫️', '🔥', '☁️'],
  },
  premium: {
    label: 'Premium',
    emojis: ['⭐', '💎', '👑', '✨', '🏆'],
  },
  veiculos: {
    label: 'Veículos',
    emojis: ['🚗', '🏍️', '🚙', '🚛', '🚕'],
  },
  cores: {
    label: 'Cores',
    emojis: ['🔵', '🟢', '🟡', '🟠', '🟣', '⚫', '⚪', '🔴'],
  },
} as const;

// ============================================================================
// Fuel Type Form Modal
// ============================================================================

export interface FuelTypeFormModalProps {
  visible: boolean;
  editingFuelType?: FuelTypeDB | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FuelTypeFormModal({ 
  visible, 
  editingFuelType, 
  onSuccess, 
  onCancel 
}: FuelTypeFormModalProps) {
  const insets = useSafeAreaInsets();
  const { showToast, ToastComponent } = useToast();
  
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EmojiCategory>('liquidos');

  const isEditMode = !!editingFuelType;
  const isDefaultType = editingFuelType?.isDefault === 1;

  // Pre-fill form when editing
  useEffect(() => {
    if (!visible) return;
    
    if (editingFuelType) {
      setName(editingFuelType.name);
      setEmoji(editingFuelType.emoji);
      setDescription(editingFuelType.description);
      setPrice(String(editingFuelType.pricePerLiter));
    } else {
      // Reset form for new fuel type
      setName('');
      setEmoji('');
      setDescription('');
      setPrice('');
      setSelectedCategory('liquidos'); // Reset to first category
    }
  }, [visible, editingFuelType]);

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
      if (isEditMode) {
        // Update existing fuel type
        await updateFuelType(editingFuelType.id, {
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
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving fuel type:', error);
      showToast(error.message || 'Erro ao salvar combustível', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        <Pressable
          className="flex-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={onCancel}
        />
        <View 
          className="bg-bg-surface rounded-t-3xl" 
          style={{ 
            maxHeight: '90%',
            paddingBottom: insets.bottom + 24 
          }}
        >
          <ScrollView
            className="px-6 pt-6"
            contentContainerStyle={{ gap: 20, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Handle bar */}
            <View className="w-10 h-1 bg-bg-border rounded-full self-center mb-1" />

            <Text className="font-display-bold text-2xl text-text-primary">
              {isEditMode ? 'Editar Combustível' : 'Novo Combustível'}
            </Text>

            {/* Name field */}
            <View className="gap-2">
              <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
                Nome
              </Text>
              <TextInput
                className="bg-bg-base border border-bg-border rounded-xl px-4 text-text-primary font-sans text-base"
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

            {/* Emoji picker */}
            <View className="gap-2">
              <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
                Emoji (ícone visual)
              </Text>
              
              {/* Selected emoji preview */}
              <View className="bg-bg-base border border-bg-border rounded-xl items-center justify-center" style={{ height: 64 }}>
                <Text style={{ fontSize: 40 }}>{emoji || '❓'}</Text>
              </View>

              {/* Category tabs */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="gap-2"
                contentContainerStyle={{ gap: 8 }}
              >
                {(Object.keys(FUEL_EMOJI_CATEGORIES) as EmojiCategory[]).map((category) => {
                  const isSelected = selectedCategory === category;
                  return (
                    <Pressable
                      key={category}
                      onPress={() => setSelectedCategory(category)}
                      disabled={isSubmitting}
                      className={cn(
                        'px-4 py-2 rounded-lg border',
                        isSelected
                          ? 'bg-accent/20 border-accent'
                          : 'bg-bg-base border-bg-border',
                        isSubmitting && 'opacity-40'
                      )}
                    >
                      <Text className={cn(
                        'font-sans-bold text-sm',
                        isSelected ? 'text-accent' : 'text-text-muted'
                      )}>
                        {FUEL_EMOJI_CATEGORIES[category].label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Emoji grid selector (filtered by selected category) */}
              <View className="flex-row flex-wrap gap-2">
                {FUEL_EMOJI_CATEGORIES[selectedCategory].emojis.map((emojiOption) => (
                  <Pressable
                    key={emojiOption}
                    onPress={() => setEmoji(emojiOption)}
                    disabled={isSubmitting}
                    className={cn(
                      'items-center justify-center rounded-xl border-2',
                      emoji === emojiOption 
                        ? 'bg-accent/20 border-accent' 
                        : 'bg-bg-base border-bg-border',
                      isSubmitting && 'opacity-40'
                    )}
                    style={{ width: 56, height: 56 }}
                  >
                    <Text style={{ fontSize: 30 }}>{emojiOption}</Text>
                  </Pressable>
                ))}
              </View>
              
              <Text className="font-sans text-xs text-text-muted -mt-1">
                Selecione um emoji (opcional, padrão: ⚡)
              </Text>
            </View>

            {/* Description field */}
            <View className="gap-2">
              <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
                Descrição
              </Text>
              <TextInput
                className="bg-bg-base border border-bg-border rounded-xl px-4 text-text-primary font-sans text-base"
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
          </ScrollView>

          {/* Sticky action buttons */}
          <View className="px-6 pt-4 flex-row gap-3">
            <Button 
              onPress={onCancel} 
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
        </View>
      </KeyboardAvoidingView>

      {ToastComponent}
    </Modal>
  );
}
