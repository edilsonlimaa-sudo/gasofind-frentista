import { Button } from '@/components/ui/button';
import type { Shift } from '@/types/sales';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

// ============================================================================
// Shift Summary Card
// ============================================================================

export interface ShiftSummaryCardProps {
  shift: Shift;
  onClose?: () => void;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function ShiftSummaryCard({ shift, onClose }: ShiftSummaryCardProps) {
  const [duration, setDuration] = useState('');
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(withTiming(0.25, { duration: 900 }), -1, true);
  }, [pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));

  useEffect(() => {
    const updateDuration = () => {
      const start = new Date(shift.startedAt).getTime();
      const now = Date.now();
      const diffMs = now - start;
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      setDuration(`${hours}h ${minutes}m`);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [shift.startedAt]);

  return (
    <View className="bg-bg-surface border border-bg-border rounded-2xl p-4 gap-4">
      {/* Header: status + close button */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-2">
          <Animated.View style={pulseStyle}>
            <View className="w-2.5 h-2.5 rounded-full bg-status-green" />
          </Animated.View>
          <Text className="font-sans-bold text-xs text-status-green uppercase tracking-widest">
            Turno Ativo
          </Text>
        </View>
        {onClose && (
          <Button variant="destructive" size="sm" onPress={onClose}>
            Fechar Turno
          </Button>
        )}
      </View>

      {/* Operator info */}
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-full bg-bg-border items-center justify-center">
          <Text className="font-display-bold text-base text-accent">
            {getInitials(shift.operatorName)}
          </Text>
        </View>
        <View>
          <Text className="font-display-bold text-xl text-text-primary">
            {shift.operatorName}
          </Text>
          <Text className="font-mono text-sm text-text-muted">{duration}</Text>
        </View>
      </View>

      {/* Info row */}
      <View className="flex-row gap-4 pt-4 border-t border-bg-border">
        <View className="flex-1">
          <Text className="font-sans text-xs text-text-muted mb-1">Início</Text>
          <Text className="font-sans-bold text-sm text-text-primary">
            {new Date(shift.startedAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-sans text-xs text-text-muted mb-1">Caixa USD</Text>
          <Text className="font-mono-bold text-sm text-accent">
            ${shift.initialCashUsd.toFixed(2)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-sans text-xs text-text-muted mb-1">Caixa Bs</Text>
          <Text className="font-mono-bold text-sm text-accent">
            Bs {shift.initialCashVes.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
