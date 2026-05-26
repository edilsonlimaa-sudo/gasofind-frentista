import * as SecureStore from 'expo-secure-store';

// ============================================================================
// App Settings
// ============================================================================

const SETTINGS_KEY = 'gasofind_settings';
const DAILY_RATE_KEY = 'gasofind_daily_rate';

export interface AppSettings {
  gasolinePrice: number;
  dieselPrice: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  gasolinePrice: 0.5,
  dieselPrice: 0.5,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const stored = await SecureStore.getItemAsync(SETTINGS_KEY);
    if (!stored) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(partial: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify({ ...current, ...partial }));
}

// ============================================================================
// Daily Exchange Rate Cache (TTL = current calendar day)
// ============================================================================

function todayString(): string {
  // Returns local date as YYYY-MM-DD, e.g. "2026-05-26"
  return new Date().toLocaleDateString('en-CA');
}

/**
 * Returns the cached exchange rate if it was saved today, otherwise null.
 */
export async function getDailyExchangeRate(): Promise<number | null> {
  try {
    const stored = await SecureStore.getItemAsync(DAILY_RATE_KEY);
    if (!stored) return null;
    const parsed: { rate: number; date: string } = JSON.parse(stored);
    if (parsed.date !== todayString()) return null;
    return parsed.rate;
  } catch {
    return null;
  }
}

/**
 * Caches the exchange rate with today's date. Overwrites any previous value.
 */
export async function saveDailyExchangeRate(rate: number): Promise<void> {
  await SecureStore.setItemAsync(
    DAILY_RATE_KEY,
    JSON.stringify({ rate, date: todayString() })
  );
}
