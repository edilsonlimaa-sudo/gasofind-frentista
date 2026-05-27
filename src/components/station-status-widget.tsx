import { formatTimeRemaining, getSecondsUntilExpiration, isStatusExpired } from '@/constants/station-status';
import type { StationStatusRecord } from '@/types/station-status';
import {
  QueueLevelColor,
  QueueLevelLabels,
  STATUS_HEX,
  StationStatusColor,
  StationStatusEmojis,
  StationStatusLabels,
  statusHasQueue,
} from '@/types/station-status';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface StationStatusWidgetProps {
  status: StationStatusRecord | null;
  onPress: () => void;
}

export function StationStatusWidget({ status, onPress }: StationStatusWidgetProps) {
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Update expiration status and countdown every second
  useEffect(() => {
    if (!status?.updatedAt) {
      setIsExpired(false);
      setTimeRemaining('');
      return;
    }

    // Update immediately
    const updateStatus = () => {
      const expired = isStatusExpired(status.updatedAt, status.status);
      setIsExpired(expired);
      
      if (!expired) {
        const seconds = getSecondsUntilExpiration(status.updatedAt, status.status);
        // Only show countdown if there are seconds remaining
        if (seconds > 0) {
          setTimeRemaining(formatTimeRemaining(seconds));
        } else {
          setTimeRemaining('');
        }
      } else {
        // Clear countdown when expired
        setTimeRemaining('');
      }
    };

    updateStatus();

    // Update every second for countdown
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [status?.updatedAt, status?.status]);
  if (!status) {
    return (
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-4 bg-bg-surface border border-bg-border rounded-2xl px-4 py-4"
      >
        <View className="w-1 self-stretch rounded-full bg-bg-border" />
        <View className="flex-1">
          <Text className="font-sans-bold text-sm text-text-muted">Status do Posto</Text>
          <Text className="font-sans text-xs text-text-muted mt-0.5">
            Nenhum status definido
          </Text>
        </View>
        <Text className="font-sans-bold text-sm text-accent">Definir →</Text>
      </Pressable>
    );
  }

  const statusColorKey = StationStatusColor[status.status];
  const statusHex = STATUS_HEX[statusColorKey];
  const queueColorKey = QueueLevelColor[status.queueLevel];
  const queueHex = STATUS_HEX[queueColorKey];

  return (
    <Pressable
      onPress={onPress}
      className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden"
    >
      {/* Colored top stripe */}
      <View style={{ height: 3, backgroundColor: statusHex }} />

      <View className="px-4 py-4 gap-3">
        {/* Row 1: status label + update button */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text style={{ fontSize: 18 }}>{StationStatusEmojis[status.status]}</Text>
            <Text
              className="font-display-bold text-base"
              style={{ color: statusHex }}
            >
              {StationStatusLabels[status.status]}
            </Text>
          </View>
          <Text className="font-sans-bold text-xs text-accent">Atualizar →</Text>
        </View>

        {/* Row 2: queue badge (only when open) + reopen time + countdown/expiration */}
        {(statusHasQueue(status.status) || status.estimatedReopenAt || isExpired || timeRemaining) && (
          <View className="flex-row items-center gap-3 flex-wrap">
            {statusHasQueue(status.status) && (
              <View
                className="flex-row items-center gap-1.5 rounded-lg px-2 py-1"
                style={{ backgroundColor: `${queueHex}22` }}
              >
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: queueHex }}
                />
                <Text
                  className="font-sans-bold text-xs"
                  style={{ color: queueHex }}
                >
                  Fila: {QueueLevelLabels[status.queueLevel]}
                </Text>
              </View>
            )}

            {status.estimatedReopenAt && (
              <View className="flex-row items-center gap-1.5 bg-bg-border rounded-lg px-2 py-1">
                <Text className="font-sans text-xs text-text-muted">
                  🕐 Reabre às {status.estimatedReopenAt}
                </Text>
              </View>
            )}

            {/* Countdown timer or expired badge */}
            {isExpired ? (
              <View className="flex-row items-center gap-1.5 bg-amber-900/20 border border-amber-700/30 rounded-lg px-2 py-1">
                <Text className="font-sans-bold text-xs text-amber-200">
                  ⏱️ Expirado - Atualize
                </Text>
              </View>
            ) : timeRemaining && (
              <View className="flex-row items-center gap-1.5 bg-blue-900/20 border border-blue-700/30 rounded-lg px-2 py-1">
                <Text className="font-sans-bold text-xs text-blue-200">
                  ⏱️ Expira em {timeRemaining}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}
