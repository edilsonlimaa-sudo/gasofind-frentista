import { QueueLevelSelector } from '@/components/queue-level-selector';
import { StationStatusSelector } from '@/components/station-status-selector';
import { Button } from '@/components/ui/button';
import { upsertStationStatus } from '@/database/repositories';
import type { QueueLevel, StationStatus, StationStatusRecord } from '@/types/station-status';
import { statusNeedsReopenTime } from '@/types/station-status';
import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Statuses shown in the "after close" modal — everything except open
const CLOSE_STATUSES: StationStatus[] = [
  'no_fuel',
  'no_power',
  'temporarily_closed',
  'closed_for_day',
];

export interface StatusUpdateModalProps {
  visible: boolean;
  mode: 'after_open' | 'after_close';
  onConfirm: (record: StationStatusRecord) => void;
  onDismiss: () => void;
}

export function StatusUpdateModal({ visible, mode, onConfirm, onDismiss }: StatusUpdateModalProps) {
  const insets = useSafeAreaInsets();

  // after_open: status is always 'open', we only pick queue level
  const [queueLevel, setQueueLevel] = useState<QueueLevel>('none');

  // after_close: we pick a non-open status
  const [closeStatus, setCloseStatus] = useState<StationStatus>('closed_for_day');
  const [estimatedReopenAt, setEstimatedReopenAt] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // Reset state whenever modal opens
  useEffect(() => {
    if (!visible) return;
    setQueueLevel('none');
    setCloseStatus('closed_for_day');
    setEstimatedReopenAt('');
  }, [visible]);

  // Clear reopen time if user switches to a status that doesn't need it
  useEffect(() => {
    if (!statusNeedsReopenTime(closeStatus)) {
      setEstimatedReopenAt('');
    }
  }, [closeStatus]);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      const payload =
        mode === 'after_open'
          ? { status: 'open' as StationStatus, queueLevel, estimatedReopenAt: null }
          : {
              status: closeStatus,
              queueLevel: 'none' as QueueLevel,
              estimatedReopenAt:
                statusNeedsReopenTime(closeStatus) && estimatedReopenAt.trim()
                  ? estimatedReopenAt.trim()
                  : null,
            };

      const record = await upsertStationStatus(payload);
      onConfirm(record);
    } catch (error) {
      console.error('Error updating station status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isAfterOpen = mode === 'after_open';
  const showReopenField = !isAfterOpen && statusNeedsReopenTime(closeStatus);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        behavior="padding"
        enabled={Platform.OS === 'ios'}
        className="flex-1 justify-end"
      >
        <Pressable
          className="flex-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={onDismiss}
        />

        <View
          className="bg-bg-surface rounded-t-3xl pt-6 max-h-[85%]"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          {/* Handle bar */}
          <View className="w-10 h-1 bg-bg-border rounded-full self-center mb-5" />

          {/* Header */}
          <View className="px-6 mb-5">
            <Text className="font-display-bold text-2xl text-text-primary">
              {isAfterOpen ? 'O posto está aberto agora? 🟢' : 'Como ficou o posto?'}
            </Text>
            <Text className="font-sans text-sm text-text-muted mt-1.5">
              {isAfterOpen
                ? 'Informe o nível da fila atual para os motoristas'
                : 'Avise os motoristas sobre o estado do posto'}
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 20, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* after_open: only queue selector */}
            {isAfterOpen && (
              <QueueLevelSelector
                value={queueLevel}
                onChange={setQueueLevel}
                disabled={isSaving}
              />
            )}

            {/* after_close: non-open status selector */}
            {!isAfterOpen && (
              <StationStatusSelector
                value={closeStatus}
                onChange={setCloseStatus}
                statuses={CLOSE_STATUSES}
                disabled={isSaving}
              />
            )}

            {/* Reopen time — only for temporary closures */}
            {showReopenField && (
              <View className="gap-2">
                <Text className="font-sans-bold text-xs text-text-muted uppercase tracking-widest">
                  Previsão de reabertura (opcional)
                </Text>
                <View className="flex-row items-center bg-bg-base border border-bg-border rounded-xl overflow-hidden">
                  <View
                    className="px-4 border-r border-bg-border bg-bg-border items-center justify-center"
                    style={{ height: 52 }}
                  >
                    <Text className="font-sans-bold text-text-muted text-sm">🕐</Text>
                  </View>
                  <TextInput
                    className="flex-1 font-mono text-text-primary text-xl px-4"
                    value={estimatedReopenAt}
                    onChangeText={(text) => {
                      const digits = text.replace(/[^0-9]/g, '');
                      if (digits.length <= 2) {
                        setEstimatedReopenAt(digits);
                      } else {
                        setEstimatedReopenAt(`${digits.slice(0, 2)}:${digits.slice(2, 4)}`);
                      }
                    }}
                    placeholder="Ex: 14:30"
                    placeholderTextColor="#6B7F95"
                    keyboardType="numeric"
                    maxLength={5}
                    editable={!isSaving}
                    returnKeyType="done"
                    style={{ height: 52 }}
                  />
                </View>
              </View>
            )}

            {/* Buttons */}
            <View className="flex-row gap-3 pt-2">
              <Button
                variant="secondary"
                onPress={onDismiss}
                disabled={isSaving}
                className="flex-1"
              >
                Pular
              </Button>
              <Button
                onPress={handleConfirm}
                loading={isSaving}
                className="flex-1"
              >
                {isAfterOpen ? 'Sim, atualizar' : 'Confirmar'}
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
