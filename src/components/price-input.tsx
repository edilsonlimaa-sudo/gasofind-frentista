import { cn } from '@/lib/cn';
import { Text, TextInput, View } from 'react-native';

export interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PriceInput({ value, onChange, disabled }: PriceInputProps) {
  return (
    <View className={cn('flex-row items-center bg-bg-surface border border-bg-border rounded-xl overflow-hidden', disabled && 'opacity-40')}>
      <View className="px-4 py-3 border-r border-bg-border bg-bg-border">
        <Text className="font-sans-bold text-text-muted text-base">$</Text>
      </View>
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
      <View className="px-3 py-3 border-l border-bg-border bg-bg-border">
        <Text className="font-sans-bold text-text-muted text-xs">/L</Text>
      </View>
    </View>
  );
}
