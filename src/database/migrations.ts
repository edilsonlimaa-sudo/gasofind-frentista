// ============================================================================
// Database Migrations
// ============================================================================
// IMPORTANT: Never modify or delete existing migrations. Always append new ones.
// Each migration must be idempotent (safe to run multiple times).

export interface Migration {
  version: number;
  name: string;
  up: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: `
      -- ========================================
      -- Shifts Table
      -- ========================================
      CREATE TABLE IF NOT EXISTS shifts (
        id TEXT PRIMARY KEY NOT NULL,
        operatorName TEXT NOT NULL,
        startedAt TEXT NOT NULL,
        closedAt TEXT,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'closed')),
        
        -- Cash control
        initialCash REAL NOT NULL DEFAULT 0,
        finalCash REAL,
        cashDiscrepancy REAL,
        notes TEXT,
        
        -- Sync metadata
        syncStatus TEXT NOT NULL DEFAULT 'pending' CHECK(syncStatus IN ('pending', 'syncing', 'synced', 'error')),
        syncedAt TEXT,
        syncRetryCount INTEGER NOT NULL DEFAULT 0,
        lastSyncError TEXT,
        version INTEGER NOT NULL DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
      CREATE INDEX IF NOT EXISTS idx_shifts_sync ON shifts(syncStatus, startedAt);

      -- ========================================
      -- Sales Table
      -- ========================================
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY NOT NULL,
        shiftId TEXT NOT NULL,
        fuelType TEXT NOT NULL CHECK(fuelType IN ('gasoline', 'diesel')),
        liters REAL NOT NULL CHECK(liters > 0),
        pricePerLiter REAL NOT NULL CHECK(pricePerLiter > 0),
        totalAmount REAL NOT NULL CHECK(totalAmount > 0),
        paymentMethod TEXT NOT NULL CHECK(paymentMethod IN ('cash', 'debit_card', 'credit_card', 'bank_transfer', 'other')),
        createdAt TEXT NOT NULL,
        
        -- Soft delete
        deletedAt TEXT,
        
        -- Sync metadata
        syncStatus TEXT NOT NULL DEFAULT 'pending' CHECK(syncStatus IN ('pending', 'syncing', 'synced', 'error')),
        syncedAt TEXT,
        syncRetryCount INTEGER NOT NULL DEFAULT 0,
        lastSyncError TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        
        FOREIGN KEY (shiftId) REFERENCES shifts(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_sales_shift ON sales(shiftId, deletedAt);
      CREATE INDEX IF NOT EXISTS idx_sales_sync ON sales(syncStatus, createdAt);
      CREATE INDEX IF NOT EXISTS idx_sales_payment ON sales(paymentMethod, deletedAt);
      CREATE INDEX IF NOT EXISTS idx_sales_fuel ON sales(fuelType, deletedAt);
    `
  }
  ,
  {
    version: 2,
    name: 'add_exchange_rate_to_shifts',
    up: `
      ALTER TABLE shifts ADD COLUMN exchangeRate REAL NOT NULL DEFAULT 1;
    `
  }
];

/**
 * Get the current database schema version
 */
export function getCurrentVersion(): number {
  return MIGRATIONS.length > 0 
    ? MIGRATIONS[MIGRATIONS.length - 1].version 
    : 0;
}
