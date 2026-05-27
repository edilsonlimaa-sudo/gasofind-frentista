import { getSettings } from '@/services/settings';
import * as SQLite from 'expo-sqlite';
import { MIGRATIONS, getCurrentVersion } from './migrations';

// ============================================================================
// Database Instance
// ============================================================================

const DATABASE_NAME = 'gasofind.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Get or create the database instance
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return dbInstance;
}

/**
 * Migrate price data from old SecureStore settings to fuel_types table
 * Only runs once when fuel_types still has default prices
 */
async function migratePricesFromSettings(): Promise<void> {
  try {
    const db = await getDatabase();
    
    // Check if gasoline still has default price (0.5)
    const gasolineRow = await db.getFirstAsync<{ pricePerLiter: number }>(
      "SELECT pricePerLiter FROM fuel_types WHERE code = 'gasoline' LIMIT 1"
    );
    
    if (!gasolineRow || gasolineRow.pricePerLiter !== 0.5) {
      // Already migrated or custom price set
      return;
    }

    // Try to load old settings from SecureStore
    const oldSettings = await getSettings();
    
    if (oldSettings.gasolinePrice && oldSettings.gasolinePrice !== 0.5) {
      console.log('📦 Migrating gasoline price from settings:', oldSettings.gasolinePrice);
      await db.runAsync(
        "UPDATE fuel_types SET pricePerLiter = ?, updatedAt = ? WHERE code = 'gasoline'",
        [oldSettings.gasolinePrice, new Date().toISOString()]
      );
    }
    
    if (oldSettings.dieselPrice && oldSettings.dieselPrice !== 0.5) {
      console.log('📦 Migrating diesel price from settings:', oldSettings.dieselPrice);
      await db.runAsync(
        "UPDATE fuel_types SET pricePerLiter = ?, updatedAt = ? WHERE code = 'diesel'",
        [oldSettings.dieselPrice, new Date().toISOString()]
      );
    }
    
    console.log('✅ Price migration from settings completed');
  } catch (error) {
    console.warn('⚠️  Failed to migrate prices from settings (non-fatal):', error);
    // Non-fatal error - app can continue with default prices
  }
}

/**
 * Initialize database and run migrations
 * Should be called once at app startup
 */
export async function initDatabase(): Promise<void> {
  console.log('🗄️  Initializing database...');
  
  const db = await getDatabase();

  // Enable foreign keys (SQLite has them disabled by default)
  await db.execAsync('PRAGMA foreign_keys = ON;');
  
  // Get current schema version
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version || 0;

  console.log(`📊 Current database version: ${currentVersion}`);
  console.log(`📊 Latest migration version: ${getCurrentVersion()}`);

  // Apply pending migrations
  let migrationsApplied = 0;
  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      console.log(`⚙️  Applying migration ${migration.version}: ${migration.name}`);
      
      try {
        await db.execAsync(migration.up);
        await db.execAsync(`PRAGMA user_version = ${migration.version}`);
        migrationsApplied++;
        console.log(`✅ Migration ${migration.version} applied successfully`);
      } catch (error) {
        console.error(`❌ Migration ${migration.version} failed:`, error);
        throw new Error(`Migration ${migration.version} failed: ${error}`);
      }
    }
  }

  if (migrationsApplied > 0) {
    console.log(`✅ Applied ${migrationsApplied} migration(s)`);
  } else {
    console.log('✅ Database is up to date');
  }

  // Run data migration from old settings to fuel_types table
  await migratePricesFromSettings();
}

/**
 * Close database connection
 * Useful for cleanup in tests
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    console.log('🗄️  Database connection closed');
  }
}

/**
 * Reset database (DELETE ALL DATA!)
 * Only for development/testing
 */
export async function resetDatabase(): Promise<void> {
  if (__DEV__) {
    console.warn('⚠️  Resetting database - ALL DATA WILL BE LOST!');
    const db = await getDatabase();
    
    // Drop all tables
    await db.execAsync(`
      DROP TABLE IF EXISTS sales;
      DROP TABLE IF EXISTS shifts;
      PRAGMA user_version = 0;
    `);
    
    // Reinitialize
    await initDatabase();
    console.log('✅ Database reset complete');
  } else {
    throw new Error('resetDatabase() is only available in development mode');
  }
}

/**
 * Get database statistics (for debugging)
 */
export async function getDatabaseStats(): Promise<{
  shifts: number;
  sales: number;
  activeSales: number;
  deletedSales: number;
}> {
  const db = await getDatabase();
  
  const shiftsResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM shifts'
  );
  
  const salesResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sales'
  );
  
  const activeSalesResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sales WHERE deletedAt IS NULL'
  );
  
  const deletedSalesResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sales WHERE deletedAt IS NOT NULL'
  );

  return {
    shifts: shiftsResult?.count || 0,
    sales: salesResult?.count || 0,
    activeSales: activeSalesResult?.count || 0,
    deletedSales: deletedSalesResult?.count || 0,
  };
}
