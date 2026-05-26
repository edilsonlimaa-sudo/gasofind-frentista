import { Text, View } from 'react-native';

interface SectionHeaderProps {
  step?: number;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ step, title, subtitle }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center gap-3 mb-3">
      {step !== undefined && (
        <View className="w-7 h-7 rounded-full bg-bg-border items-center justify-center">
          <Text className="font-mono-bold text-xs text-accent">{step}</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
          {title}
        </Text>
        {subtitle && (
          <Text className="font-sans text-xs text-text-muted mt-0.5">{subtitle}</Text>
        )}
      </View>
    </View>
  );
}
