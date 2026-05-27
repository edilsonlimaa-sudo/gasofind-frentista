// ============================================================================
// Station Status Expiration Configuration
// ============================================================================

import type { StationStatus } from '@/types/station-status';
import { statusHasQueue } from '@/types/station-status';

/**
 * Number of minutes before a queue status is considered expired.
 * After this time, the UI will show an "expired" indicator to encourage
 * the attendant to update the status.
 * 
 * NOTE: Expiration only applies to statuses with queue (status === 'open').
 * Other statuses don't expire.
 */
export const STATUS_EXPIRATION_MINUTES = 0.5; // 30 seconds - FOR TESTING

/**
 * Check if a station status has expired based on its updatedAt timestamp.
 * 
 * IMPORTANT: Only statuses with queue (status === 'open') can expire.
 * Other statuses never expire.
 * 
 * @param updatedAt ISO 8601 timestamp string
 * @param status Current station status
 * @returns true if the status has queue and is older than STATUS_EXPIRATION_MINUTES
 */
export function isStatusExpired(updatedAt: string, status: StationStatus): boolean {
  // Only statuses with queue can expire
  if (!statusHasQueue(status)) {
    return false;
  }

  try {
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - updatedDate.getTime()) / 1000 / 60;
    return diffMinutes > STATUS_EXPIRATION_MINUTES;
  } catch {
    // If timestamp is invalid, consider it expired
    return true;
  }
}

/**
 * Calculate how many minutes until the status expires.
 * Returns 0 if already expired or if status doesn't have queue.
 * 
 * IMPORTANT: Only statuses with queue (status === 'open') can expire.
 * 
 * @param updatedAt ISO 8601 timestamp string
 * @param status Current station status
 * @returns Minutes remaining until expiration (0 if expired or no queue)
 */
export function getMinutesUntilExpiration(updatedAt: string, status: StationStatus): number {
  // Only statuses with queue can expire
  if (!statusHasQueue(status)) {
    return 0;
  }

  try {
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - updatedDate.getTime()) / 1000 / 60;
    const remaining = STATUS_EXPIRATION_MINUTES - diffMinutes;
    return Math.max(0, Math.ceil(remaining));
  } catch {
    return 0;
  }
}

/**
 * Calculate how many seconds until the status expires.
 * Returns 0 if already expired or if status doesn't have queue.
 * 
 * IMPORTANT: Only statuses with queue (status === 'open') can expire.
 * 
 * @param updatedAt ISO 8601 timestamp string
 * @param status Current station status
 * @returns Seconds remaining until expiration (0 if expired or no queue)
 */
export function getSecondsUntilExpiration(updatedAt: string, status: StationStatus): number {
  // Only statuses with queue can expire
  if (!statusHasQueue(status)) {
    return 0;
  }

  try {
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const diffSeconds = (now.getTime() - updatedDate.getTime()) / 1000;
    const expirationSeconds = STATUS_EXPIRATION_MINUTES * 60;
    const remaining = expirationSeconds - diffSeconds;
    return Math.max(0, Math.ceil(remaining));
  } catch {
    return 0;
  }
}

/**
 * Format time remaining for display.
 * Returns "Xm" for minutes, "Xs" for seconds under 60.
 * 
 * @param seconds Total seconds remaining
 * @returns Formatted string like "5m" or "30s"
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds === 0) return '0s';
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
  }
  return `${seconds}s`;
}
