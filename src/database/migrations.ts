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
  ,
  {
    version: 3,
    name: 'create_station_status',
    up: `
      CREATE TABLE IF NOT EXISTS station_status (
        id TEXT PRIMARY KEY NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        queueLevel TEXT NOT NULL DEFAULT 'none',
        estimatedReopenAt TEXT,
        updatedAt TEXT NOT NULL,
        syncStatus TEXT NOT NULL DEFAULT 'pending' CHECK(syncStatus IN ('pending', 'syncing', 'synced', 'error')),
        syncedAt TEXT,
        version INTEGER NOT NULL DEFAULT 1
      );
    `
  }
  ,
  {
    version: 4,
    name: 'create_fuel_types',
    up: `
      -- ========================================
      -- Fuel Types Table
      -- ========================================
      CREATE TABLE IF NOT EXISTS fuel_types (
        id TEXT PRIMARY KEY NOT NULL,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        emoji TEXT NOT NULL,
        description TEXT NOT NULL,
        pricePerLiter REAL NOT NULL CHECK(pricePerLiter >= 0),
        enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0, 1)),
        isDefault INTEGER NOT NULL DEFAULT 0 CHECK(isDefault IN (0, 1)),
        displayOrder INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_fuel_types_enabled ON fuel_types(enabled, displayOrder);
      CREATE INDEX IF NOT EXISTS idx_fuel_types_code ON fuel_types(code);

      -- ========================================
      -- Insert Default Fuel Types
      -- ========================================
      INSERT OR IGNORE INTO fuel_types (
        id, code, name, emoji, description, pricePerLiter, enabled, isDefault, displayOrder, createdAt, updatedAt
      ) VALUES
        ('gasoline', 'gasoline', 'Gasolina', '⛽', 'Premium 87 / 91 octanos', 0.5, 1, 1, 1, datetime('now'), datetime('now')),
        ('diesel', 'diesel', 'Diesel', '🚛', 'Para caminhões e maquinaria', 0.5, 0, 1, 2, datetime('now'), datetime('now'));
    `
  }
  ,
  {
    version: 5,
    name: 'update_sales_fuel_type_constraint',
    up: `
      -- ========================================
      -- Recreate Sales Table with FK to fuel_types
      -- ========================================
      -- SQLite doesn't support DROP CONSTRAINT, so we need to recreate the table
      
      -- Step 1: Create new sales table with FK and without hardcoded fuel type CHECK
      CREATE TABLE IF NOT EXISTS sales_new (
        id TEXT PRIMARY KEY NOT NULL,
        shiftId TEXT NOT NULL,
        fuelType TEXT NOT NULL,
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
        
        FOREIGN KEY (shiftId) REFERENCES shifts(id) ON DELETE CASCADE,
        FOREIGN KEY (fuelType) REFERENCES fuel_types(code) ON DELETE RESTRICT
      );

      -- Step 2: Copy existing data (only if sales_new is empty and sales exists)
      INSERT INTO sales_new 
      SELECT * FROM sales 
      WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='sales')
        AND NOT EXISTS (SELECT 1 FROM sales_new);

      -- Step 3: Drop old sales table (if it exists and sales_new has data or sales is empty)
      DROP TABLE IF EXISTS sales;

      -- Step 4: Rename sales_new to sales
      ALTER TABLE sales_new RENAME TO sales;

      -- Step 5: Recreate indexes
      CREATE INDEX IF NOT EXISTS idx_sales_shift ON sales(shiftId, deletedAt);
      CREATE INDEX IF NOT EXISTS idx_sales_sync ON sales(syncStatus, createdAt);
      CREATE INDEX IF NOT EXISTS idx_sales_payment ON sales(paymentMethod, deletedAt);
      CREATE INDEX IF NOT EXISTS idx_sales_fuel ON sales(fuelType, deletedAt);
    `
  }
  ,
  {
    version: 6,
    name: 'add_pago_movil_and_payment_reference',
    up: `
      -- ========================================
      -- Add Pago Móvil payment method and payment reference field
      -- ========================================
      -- SQLite doesn't support ALTER TABLE for CHECK constraints, so we recreate the table
      
      -- Step 1: Create new sales table with updated payment methods and reference field
      CREATE TABLE IF NOT EXISTS sales_new (
        id TEXT PRIMARY KEY NOT NULL,
        shiftId TEXT NOT NULL,
        fuelType TEXT NOT NULL,
        liters REAL NOT NULL CHECK(liters > 0),
        pricePerLiter REAL NOT NULL CHECK(pricePerLiter > 0),
        totalAmount REAL NOT NULL CHECK(totalAmount > 0),
        paymentMethod TEXT NOT NULL CHECK(paymentMethod IN ('cash', 'debit_card', 'credit_card', 'bank_transfer', 'pago_movil', 'other')),
        paymentReference TEXT,
        createdAt TEXT NOT NULL,
        
        -- Soft delete
        deletedAt TEXT,
        
        -- Sync metadata
        syncStatus TEXT NOT NULL DEFAULT 'pending' CHECK(syncStatus IN ('pending', 'syncing', 'synced', 'error')),
        syncedAt TEXT,
        syncRetryCount INTEGER NOT NULL DEFAULT 0,
        lastSyncError TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        
        FOREIGN KEY (shiftId) REFERENCES shifts(id) ON DELETE CASCADE,
        FOREIGN KEY (fuelType) REFERENCES fuel_types(code) ON DELETE RESTRICT
      );

      -- Step 2: Copy existing data
      INSERT INTO sales_new (
        id, shiftId, fuelType, liters, pricePerLiter, totalAmount,
        paymentMethod, paymentReference, createdAt, deletedAt,
        syncStatus, syncedAt, syncRetryCount, lastSyncError, version
      )
      SELECT 
        id, shiftId, fuelType, liters, pricePerLiter, totalAmount,
        paymentMethod, NULL as paymentReference, createdAt, deletedAt,
        syncStatus, syncedAt, syncRetryCount, lastSyncError, version
      FROM sales;

      -- Step 3: Drop old sales table
      DROP TABLE sales;

      -- Step 4: Rename sales_new to sales
      ALTER TABLE sales_new RENAME TO sales;

      -- Step 5: Recreate indexes
      CREATE INDEX IF NOT EXISTS idx_sales_shift ON sales(shiftId, deletedAt);
      CREATE INDEX IF NOT EXISTS idx_sales_sync ON sales(syncStatus, createdAt);
      CREATE INDEX IF NOT EXISTS idx_sales_payment ON sales(paymentMethod, deletedAt);
      CREATE INDEX IF NOT EXISTS idx_sales_fuel ON sales(fuelType, deletedAt);
      CREATE INDEX IF NOT EXISTS idx_sales_payment_ref ON sales(paymentReference);
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
