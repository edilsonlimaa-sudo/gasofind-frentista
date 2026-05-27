import { QueueLevelSelector } from '@/components/queue-level-selector';
import { StationStatusSelector } from '@/components/station-status-selector';
import { useToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { isStatusExpired } from '@/constants/station-status';
import { getStationStatus, upsertStationStatus } from '@/database/repositories';
import type { QueueLevel, StationStatus } from '@/types/station-status';
import { statusHasQueue, statusNeedsReopenTime } from '@/types/station-status';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CrowdControl() {
  const { showToast, ToastComponent } = useToast();

  const [status, setStatus] = useState<StationStatus>('open');
  const [queueLevel, setQueueLevel] = useState<QueueLevel>('none');
  const [estimatedReopenAt, setEstimatedReopenAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentStatusExpired, setCurrentStatusExpired] = useState(false);

  // Load current status on mount
  useEffect(() => {
    getStationStatus().then((current) => {
      if (!current) return;
      setStatus(current.status);
      setQueueLevel(current.queueLevel);
      setEstimatedReopenAt(current.estimatedReopenAt ?? '');
      setCurrentStatusExpired(isStatusExpired(current.updatedAt, current.status));
    });
  }, []);

  // Reset queue when switching to a status where queue is irrelevant
  useEffect(() => {
    if (!statusHasQueue(status)) {
      setQueueLevel('none');
    }
  }, [status]);

  // Clear reopen time when switching to a status that doesn't need it
  useEffect(() => {
    if (!statusNeedsReopenTime(status)) {
      setEstimatedReopenAt('');
    }
  }, [status]);

  const handleSave = async () => {
    if (showReopenField && estimatedReopenAt.trim()) {
      const parts = estimatedReopenAt.split(':');
      const hh = parseInt(parts[0] ?? '', 10);
      const mm = parseInt(parts[1] ?? '', 10);
      if (parts.length !== 2 || isNaN(hh) || isNaN(mm) || hh > 23 || mm > 59) {
        showToast('Hora inválida. Use o formato HH:MM (ex: 14:30)', 'error');
        return;
      }
    }

    setIsSaving(true);
    try {
      await upsertStationStatus({
        status,
        queueLevel,
        estimatedReopenAt: statusNeedsReopenTime(status) && estimatedReopenAt.trim()
          ? estimatedReopenAt.trim()
          : null,
      });
      showToast('Status atualizado!', 'success');
      setTimeout(() => router.back(), 700);
    } catch (error: any) {
      console.error('Error saving station status:', error);
      showToast('Erro ao salvar status', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showQueueField = statusHasQueue(status);
  const showReopenField = statusNeedsReopenTime(status);
  // Step numbers shift depending on visible sections
  const reopenStep = showQueueField ? 3 : 2;

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-3 flex-row items-center gap-3 border-b border-bg-border">
          <Pressable
            className="w-10 h-10 rounded-xl bg-bg-surface border border-bg-border items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="text-text-primary text-xl">←</Text>
          </Pressable>
          <View>
            <Text className="font-display-bold text-xl text-text-primary">
              Controle de Multidões
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Warning banner when status is expired */}
          {currentStatusExpired && (
            <View className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3">
              <Text className="font-sans-bold text-sm text-amber-200 mb-1">
                ⚠️ Status Expirado
              </Text>
              <Text className="font-sans text-xs text-amber-200">
                O status atual está desatualizado há mais de 30 minutos. Atualize para manter os clientes bem informados sobre a situação do posto!
              </Text>
            </View>
          )}

          {/* Status */}
          <View className="gap-3">
            <SectionHeader step={1} title="Status do Posto" />
            <StationStatusSelector value={status} onChange={setStatus} disabled={isSaving} />
          </View>

          {/* Queue level — only meaningful when open */}
          {showQueueField && (
            <View className="gap-3">
              <SectionHeader step={2} title="Nível da Fila" />
              <QueueLevelSelector value={queueLevel} onChange={setQueueLevel} disabled={isSaving} />
            </View>
          )}

          {/* Estimated reopen — shown only when relevant */}
          {showReopenField && (
            <View className="gap-3">
              <SectionHeader step={reopenStep} title="Previsão de Reabertura" />
              <View className="flex-row items-center bg-bg-surface border border-bg-border rounded-xl overflow-hidden">
                <View
                  className="px-4 border-r border-bg-border bg-bg-border items-center justify-center"
                  style={{ height: 56 }}
                >
                  <Text className="font-sans-bold text-text-muted text-sm">🕐</Text>
                </View>
                <TextInput
                  className="flex-1 font-mono text-text-primary text-xl px-4"
                  value={estimatedReopenAt}
                  onChangeText={(text) => {
                    // Allow only digits and colon, auto-insert colon at position 2
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
                  style={{ height: 56 }}
                />
                <View
                  className="px-3 border-l border-bg-border bg-bg-border items-center justify-center"
                  style={{ height: 56 }}
                >
                  <Text className="font-sans text-xs text-text-muted">opcional</Text>
                </View>
              </View>
              <Text className="font-sans text-xs text-text-muted">
                Deixe em branco se não souber quando vai reabrir.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Sticky save */}
        <View className="px-4 py-3 border-t border-bg-border bg-bg-base">
          <Button onPress={handleSave} loading={isSaving} size="lg">
            Salvar Status
          </Button>
        </View>
      </KeyboardAvoidingView>

      {ToastComponent}
    </SafeAreaView>
  );
}
