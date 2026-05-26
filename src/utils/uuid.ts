// ============================================================================
// Pure JS UUID v4 generator
// Uses Math.random() — no native modules required.
// Adequate for local SQLite IDs in an offline app.
// ============================================================================

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
