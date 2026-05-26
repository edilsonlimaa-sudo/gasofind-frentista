import { cn } from '@/lib/cn';
import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-accent',
  secondary: 'bg-bg-surface border border-bg-border',
  destructive: 'bg-status-red',
  ghost: 'bg-transparent',
};

const TEXT_COLOR: Record<Variant, string> = {
  primary: 'text-bg-base',
  secondary: 'text-text-primary',
  destructive: 'text-bg-base',
  ghost: 'text-text-muted',
};

const SIZE_CONTAINER: Record<Size, string> = {
  sm: 'h-10 px-4 rounded-lg',
  md: 'h-14 px-6 rounded-xl',
  lg: 'h-16 px-8 rounded-2xl',
};

const SIZE_TEXT: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
      }}
      disabled={disabled || loading}
      style={animStyle}
      className={cn(
        'items-center justify-center flex-row gap-2',
        CONTAINER[variant],
        SIZE_CONTAINER[size],
        (disabled || loading) && 'opacity-40',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? '#080C12' : '#00B8D9'}
        />
      ) : typeof children === 'string' ? (
        <Text className={cn('font-sans-bold', TEXT_COLOR[variant], SIZE_TEXT[size])}>
          {children}
        </Text>
      ) : (
        children
      )}
    </AnimatedPressable>
  );
}
