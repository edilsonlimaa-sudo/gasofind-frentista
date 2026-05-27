import type { StationStatus } from '@/types/station-status';
import {
    STATUS_HEX,
    StationStatusColor,
    StationStatusDescriptions,
    StationStatusEmojis,
    StationStatusLabels,
} from '@/types/station-status';
import { Pressable, Text, View } from 'react-native';

const ALL_STATUSES: StationStatus[] = [
  'open',
  'no_fuel',
  'no_power',
  'temporarily_closed',
  'closed_for_day',
];

interface StationStatusSelectorProps {
  value: StationStatus | null;
  onChange: (v: StationStatus) => void;
  disabled?: boolean;
  /** Restrict which statuses are shown. Defaults to all 5. */
  statuses?: StationStatus[];
}

export function StationStatusSelector({ value, onChange, disabled, statuses }: StationStatusSelectorProps) {
  const list = statuses ?? ALL_STATUSES;
  return (
    <View className="gap-2">
      {list.map((status) => {
        const isSelected = value === status;
        const colorKey = StationStatusColor[status];
        const hex = STATUS_HEX[colorKey];

        return (
          <Pressable
            key={status}
            onPress={() => !disabled && onChange(status)}
            className="flex-row items-center gap-4 bg-bg-surface border rounded-2xl px-4 py-3"
            style={{
              borderColor: isSelected ? hex : '#1C2A3A',
              borderWidth: isSelected ? 2 : 1,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {/* Color dot */}
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: isSelected ? hex : '#1C2A3A' }}
            />

            <View className="flex-1">
              <Text
                className="font-sans-bold text-sm"
                style={{ color: isSelected ? hex : '#E2EAF2' }}
              >
                {StationStatusEmojis[status]}  {StationStatusLabels[status]}
              </Text>
              <Text className="font-sans text-xs text-text-muted mt-0.5">
                {StationStatusDescriptions[status]}
              </Text>
            </View>

            {/* Selected checkmark */}
            {isSelected && (
              <View
                className="w-6 h-6 rounded-full items-center justify-center"
                style={{ backgroundColor: hex }}
              >
                <Text className="text-bg-base font-sans-bold text-xs">✓</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
