import { cn } from '@/lib/cn';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ============================================================================
// Emoji Categories
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
// Emoji Picker Bottom Sheet Component
// ============================================================================

export interface EmojiPickerBottomSheetProps {
  visible: boolean;
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPickerBottomSheet({
  visible,
  selectedEmoji,
  onSelect,
  onClose,
}: EmojiPickerBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<EmojiCategory>('liquidos');

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onPress={onClose}
      />
      <View
        className="bg-bg-surface rounded-t-3xl"
        style={{
          maxHeight: '75%',
          paddingBottom: insets.bottom + 24,
        }}
      >
        <ScrollView
          className="px-6 pt-6"
          contentContainerStyle={{ gap: 20, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Handle bar */}
          <View className="w-10 h-1 bg-bg-border rounded-full self-center mb-1" />

          <Text className="font-display-bold text-2xl text-text-primary">
            Selecionar Emoji
          </Text>

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
                  className={cn(
                    'px-4 py-2 rounded-lg border',
                    isSelected
                      ? 'bg-accent/20 border-accent'
                      : 'bg-bg-base border-bg-border'
                  )}
                >
                  <Text
                    className={cn(
                      'font-sans-bold text-sm',
                      isSelected ? 'text-accent' : 'text-text-muted'
                    )}
                  >
                    {FUEL_EMOJI_CATEGORIES[category].label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Emoji grid selector (filtered by selected category) */}
          <View className="flex-row flex-wrap gap-2 pb-4">
            {FUEL_EMOJI_CATEGORIES[selectedCategory].emojis.map((emojiOption) => (
              <Pressable
                key={emojiOption}
                onPress={() => handleEmojiSelect(emojiOption)}
                className={cn(
                  'items-center justify-center rounded-xl border-2',
                  selectedEmoji === emojiOption
                    ? 'bg-accent/20 border-accent'
                    : 'bg-bg-base border-bg-border'
                )}
                style={{ width: 64, height: 64 }}
              >
                <Text style={{ fontSize: 36 }}>{emojiOption}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
