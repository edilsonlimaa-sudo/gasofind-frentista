import { cn } from '@/lib/cn';
import { Text, TextInput, View } from 'react-native';

export interface VolumeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function VolumeInput({ value, onChange, disabled }: VolumeInputProps) {
  return (
    <View className={cn('flex-row items-center bg-bg-surface border border-bg-border rounded-xl overflow-hidden', disabled && 'opacity-40')}>
      <TextInput
        className="flex-1 font-mono text-text-primary text-2xl px-4 py-3"
        value={value}
        onChangeText={(text) => onChange(text.replace(/[^0-9.,]/g, ''))}
        placeholder="0.00"
        placeholderTextColor="#6B7F95"
        keyboardType="decimal-pad"
        editable={!disabled}
        returnKeyType="next"
        style={{ minHeight: 56 }}
      />
      <View className="px-4 py-3 border-l border-bg-border bg-bg-border">
        <Text className="font-sans-bold text-text-muted text-base">L</Text>
      </View>
    </View>
  );
}
