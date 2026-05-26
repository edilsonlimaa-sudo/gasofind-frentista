import { cn } from '@/lib/cn';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

const BG: Record<ToastType, string> = {
  success: 'bg-status-green',
  error: 'bg-status-red',
  info: 'bg-accent',
};

export function Toast({ message, type = 'info', duration = 3000, onHide }: ToastProps) {
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 220 });
    opacity.value = withTiming(1, { duration: 220 });

    const timer = setTimeout(() => {
      translateY.value = withTiming(80, { duration: 220 });
      opacity.value = withTiming(0, { duration: 220 }, (finished) => {
        if (finished && onHide) runOnJS(onHide)();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onHide, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[animStyle, { position: 'absolute', bottom: 32, left: 16, right: 16, zIndex: 9999 }]}
    >
      <Text
        className={cn(
          'font-sans-bold text-sm text-bg-base text-center rounded-2xl px-5 py-4',
          BG[type],
        )}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

export function useToast() {
  const [toast, setToast] = React.useState<(ToastProps & { id: number }) | null>(null);

  const showToast = React.useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type, id: Date.now(), onHide: () => setToast(null) });
  }, []);

  const ToastComponent = toast ? (
    <Toast key={toast.id} message={toast.message} type={toast.type} onHide={toast.onHide} />
  ) : null;

  return { showToast, ToastComponent };
}

