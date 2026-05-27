import type { QueueLevel, StationStatus, StationStatusRecord } from '@/types/station-status';
import { getDatabase } from '../index';

const CURRENT_ID = 'current';

// ============================================================================
// Station Status Repository
// ============================================================================

/**
 * Get the current station status. Returns null if never set.
 */
export async function getStationStatus(): Promise<StationStatusRecord | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<StationStatusRecord>(
    'SELECT * FROM station_status WHERE id = ? LIMIT 1',
    [CURRENT_ID]
  );
  return row ?? null;
}

/**
 * Insert or replace the station status (single-row table).
 */
export async function upsertStationStatus(params: {
  status: StationStatus;
  queueLevel: QueueLevel;
  estimatedReopenAt: string | null;
}): Promise<StationStatusRecord> {
  const db = await getDatabase();

  const existing = await getStationStatus();
  const nextVersion = existing ? existing.version + 1 : 1;
  const now = new Date().toISOString();

  const record: StationStatusRecord = {
    id: CURRENT_ID,
    status: params.status,
    queueLevel: params.queueLevel,
    estimatedReopenAt: params.estimatedReopenAt,
    updatedAt: now,
    syncStatus: 'pending',
    syncedAt: null,
    version: nextVersion,
  };

  await db.runAsync(
    `INSERT OR REPLACE INTO station_status
       (id, status, queueLevel, estimatedReopenAt, updatedAt, syncStatus, syncedAt, version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.status,
      record.queueLevel,
      record.estimatedReopenAt,
      record.updatedAt,
      record.syncStatus,
      record.syncedAt,
      record.version,
    ]
  );

  console.log(`✅ Station status updated: ${record.status} / queue: ${record.queueLevel}`);
  return record;
}
