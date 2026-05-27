// ============================================================================
// Station Status Types
// ============================================================================

export type StationStatus =
  | 'open'               // Aberto — operando normalmente
  | 'no_fuel'            // Sem combustível — acabou o estoque
  | 'no_power'           // Sem luz — racionamento elétrico
  | 'temporarily_closed' // Fechado temporariamente — voltará hoje
  | 'closed_for_day';    // Encerrado — não volta mais hoje

export type QueueLevel =
  | 'none'   // Sem fila
  | 'short'  // Curta
  | 'medium' // Média
  | 'long'   // Longa
  | 'huge';  // Enorme

export interface StationStatusRecord {
  id: string;                  // Always 'current' — single-row table
  status: StationStatus;
  queueLevel: QueueLevel;
  estimatedReopenAt: string | null; // Free text HH:MM, only when temporarily closed
  updatedAt: string;                // ISO 8601 timestamp
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  syncedAt: string | null;
  version: number;
}

// ============================================================================
// Labels
// ============================================================================

export const StationStatusLabels: Record<StationStatus, string> = {
  open: 'Aberto',
  no_fuel: 'Sem Combustível',
  no_power: 'Sem Luz',
  temporarily_closed: 'Fechado Temporariamente',
  closed_for_day: 'Encerrado',
};

export const StationStatusDescriptions: Record<StationStatus, string> = {
  open: 'Operando normalmente',
  no_fuel: 'Estoque de combustível esgotado',
  no_power: 'Racionamento elétrico em andamento',
  temporarily_closed: 'Pausa operacional, volta em breve',
  closed_for_day: 'Expediente encerrado por hoje',
};

export const StationStatusEmojis: Record<StationStatus, string> = {
  open: '🟢',
  no_fuel: '⛽',
  no_power: '⚡',
  temporarily_closed: '⏸️',
  closed_for_day: '🔒',
};

export const QueueLevelLabels: Record<QueueLevel, string> = {
  none: 'Sem fila',
  short: 'Curta',
  medium: 'Média',
  long: 'Longa',
  huge: 'Enorme',
};

// ============================================================================
// Color tokens (maps to NativeWind class suffixes)
// ============================================================================

export const StationStatusColor: Record<StationStatus, 'status-green' | 'status-amber' | 'status-red'> = {
  open: 'status-green',
  no_fuel: 'status-amber',
  no_power: 'status-amber',
  temporarily_closed: 'status-amber',
  closed_for_day: 'status-red',
};

export const QueueLevelColor: Record<QueueLevel, 'status-green' | 'status-amber' | 'status-red'> = {
  none: 'status-green',
  short: 'status-green',
  medium: 'status-amber',
  long: 'status-amber',
  huge: 'status-red',
};

// Raw hex values for use in inline styles
export const STATUS_HEX: Record<'status-green' | 'status-amber' | 'status-red', string> = {
  'status-green': '#00E5A0',
  'status-amber': '#FFB020',
  'status-red': '#FF3F5B',
};

/** Returns true if the status implies the station may reopen later today */
export function statusNeedsReopenTime(status: StationStatus): boolean {
  return status === 'no_fuel' || status === 'no_power' || status === 'temporarily_closed';
}

/** Returns true if a queue level is meaningful for the given status */
export function statusHasQueue(status: StationStatus): boolean {
  return status === 'open';
}
