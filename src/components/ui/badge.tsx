import { cn } from '@/lib/cn';
import { Text, View } from 'react-native';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'accent';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const CONTAINER: Record<BadgeVariant, string> = {
  success: 'bg-status-green',
  error: 'bg-status-red',
  warning: 'bg-status-amber',
  info: 'bg-status-blue',
  neutral: 'bg-bg-border',
  accent: 'bg-accent',
};

const TEXT_COLOR: Record<BadgeVariant, string> = {
  success: 'text-bg-base',
  error: 'text-bg-base',
  warning: 'text-bg-base',
  info: 'text-bg-base',
  neutral: 'text-text-muted',
  accent: 'text-bg-base',
};

export function Badge({ label, variant = 'neutral', className }: BadgeProps) {
  return (
    <View className={cn('px-2.5 py-1 rounded-full', CONTAINER[variant], className)}>
      <Text className={cn('font-sans-bold text-xs', TEXT_COLOR[variant])}>
        {label}
      </Text>
    </View>
  );
}
