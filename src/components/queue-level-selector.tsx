import type { QueueLevel } from '@/types/station-status';
import {
    QueueLevelColor,
    QueueLevelLabels,
    STATUS_HEX,
} from '@/types/station-status';
import { Pressable, Text, View } from 'react-native';

const LEVELS: QueueLevel[] = ['none', 'short', 'medium', 'long', 'huge'];

interface QueueLevelSelectorProps {
  value: QueueLevel | null;
  onChange: (v: QueueLevel) => void;
  disabled?: boolean;
}

export function QueueLevelSelector({ value, onChange, disabled }: QueueLevelSelectorProps) {
  return (
    <View className="flex-row gap-2">
      {LEVELS.map((level) => {
        const isSelected = value === level;
        const colorKey = QueueLevelColor[level];
        const hex = STATUS_HEX[colorKey];

        return (
          <Pressable
            key={level}
            onPress={() => !disabled && onChange(level)}
            className="flex-1 items-center justify-center rounded-xl py-3"
            style={{
              backgroundColor: isSelected ? `${hex}22` : '#0F1520',
              borderWidth: isSelected ? 2 : 1,
              borderColor: isSelected ? hex : '#1C2A3A',
              opacity: disabled ? 0.5 : 1,
              minHeight: 56,
            }}
          >
            <Text
              className="font-sans-bold text-xs text-center"
              style={{ color: isSelected ? hex : '#6B7F95' }}
              numberOfLines={2}
            >
              {QueueLevelLabels[level]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
