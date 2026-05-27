import { generateUUID } from '@/utils/uuid';
import { getDatabase } from '../index';

// ============================================================================
// Fuel Types Repository
// ============================================================================

/**
 * Generate a unique code from the fuel type name
 * Ex: "GLP" -> "glp", "Gasolina Premium" -> "gasolina_premium"
 */
function generateCodeFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s]/g, '') // Remove non-alphanumeric except spaces
    .trim()
    .replace(/\s+/g, '_'); // Replace spaces with underscores
}

/**
 * Ensure code uniqueness by appending a number if needed
 * Ex: "glp" -> "glp_2" if "glp" already exists
 */
async function ensureUniqueCode(baseCode: string): Promise<string> {
  const db = await getDatabase();
  let code = baseCode;
  let counter = 2;
  
  while (await getFuelTypeByCode(code)) {
    code = `${baseCode}_${counter}`;
    counter++;
  }
  
  return code;
}

export interface FuelTypeDB {
  id: string;
  code: string;
  name: string;
  emoji: string;
  description: string;
  pricePerLiter: number;
  enabled: number;          // SQLite boolean (0 or 1)
  isDefault: number;        // SQLite boolean (0 or 1)
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all fuel types, ordered by displayOrder
 */
export async function getFuelTypes(): Promise<FuelTypeDB[]> {
  const db = await getDatabase();
  
  const fuelTypes = await db.getAllAsync<FuelTypeDB>(
    'SELECT * FROM fuel_types ORDER BY displayOrder ASC, name ASC'
  );

  return fuelTypes;
}

/**
 * Get only enabled fuel types, ordered by displayOrder
 */
export async function getEnabledFuelTypes(): Promise<FuelTypeDB[]> {
  const db = await getDatabase();
  
  const fuelTypes = await db.getAllAsync<FuelTypeDB>(
    'SELECT * FROM fuel_types WHERE enabled = 1 ORDER BY displayOrder ASC, name ASC'
  );

  return fuelTypes;
}

/**
 * Get a fuel type by its code
 */
export async function getFuelTypeByCode(code: string): Promise<FuelTypeDB | null> {
  const db = await getDatabase();
  
  const fuelType = await db.getFirstAsync<FuelTypeDB>(
    'SELECT * FROM fuel_types WHERE code = ? LIMIT 1',
    [code]
  );

  return fuelType || null;
}

/**
 * Get a fuel type by its ID
 */
export async function getFuelTypeById(id: string): Promise<FuelTypeDB | null> {
  const db = await getDatabase();
  
  const fuelType = await db.getFirstAsync<FuelTypeDB>(
    'SELECT * FROM fuel_types WHERE id = ? LIMIT 1',
    [id]
  );

  return fuelType || null;
}

/**
 * Update a fuel type (name, emoji, description, price, enabled)
 */
export async function updateFuelType(
  id: string,
  params: {
    name?: string;
    emoji?: string;
    description?: string;
    pricePerLiter?: number;
    enabled?: boolean;
  }
): Promise<void> {
  const db = await getDatabase();

  const existing = await getFuelTypeById(id);
  if (!existing) {
    throw new Error('Tipo de combustível não encontrado');
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (params.name !== undefined) {
    updates.push('name = ?');
    values.push(params.name);
  }
  if (params.emoji !== undefined) {
    updates.push('emoji = ?');
    values.push(params.emoji);
  }
  if (params.description !== undefined) {
    updates.push('description = ?');
    values.push(params.description);
  }
  if (params.pricePerLiter !== undefined) {
    if (params.pricePerLiter < 0) {
      throw new Error('Preço não pode ser negativo');
    }
    updates.push('pricePerLiter = ?');
    values.push(params.pricePerLiter);
  }
  if (params.enabled !== undefined) {
    updates.push('enabled = ?');
    values.push(params.enabled ? 1 : 0);
  }

  if (updates.length === 0) {
    return; // Nothing to update
  }

  updates.push('updatedAt = ?');
  values.push(new Date().toISOString());

  values.push(id);

  await db.runAsync(
    `UPDATE fuel_types SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  console.log(`✅ Fuel type updated: ${existing.name} (${id})`);
}

/**
 * Create a new custom fuel type
 * The code is automatically generated from the name
 */
export async function createCustomFuelType(params: {
  name: string;
  emoji: string;
  description: string;
  pricePerLiter: number;
  enabled?: boolean;
}): Promise<FuelTypeDB> {
  const db = await getDatabase();

  if (params.pricePerLiter < 0) {
    throw new Error('Preço não pode ser negativo');
  }

  // Generate unique code from name
  const baseCode = generateCodeFromName(params.name);
  const uniqueCode = await ensureUniqueCode(baseCode);

  // Get the highest displayOrder and add 1
  const maxOrder = await db.getFirstAsync<{ maxOrder: number | null }>(
    'SELECT MAX(displayOrder) as maxOrder FROM fuel_types'
  );
  const displayOrder = (maxOrder?.maxOrder ?? 0) + 1;

  const now = new Date().toISOString();
  const fuelType: FuelTypeDB = {
    id: generateUUID(),
    code: uniqueCode,
    name: params.name,
    emoji: params.emoji,
    description: params.description,
    pricePerLiter: params.pricePerLiter,
    enabled: params.enabled !== false ? 1 : 0,
    isDefault: 0, // Custom fuel types are never default
    displayOrder,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO fuel_types (
      id, code, name, emoji, description, pricePerLiter, 
      enabled, isDefault, displayOrder, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      fuelType.id,
      fuelType.code,
      fuelType.name,
      fuelType.emoji,
      fuelType.description,
      fuelType.pricePerLiter,
      fuelType.enabled,
      fuelType.isDefault,
      fuelType.displayOrder,
      fuelType.createdAt,
      fuelType.updatedAt,
    ]
  );

  console.log(`✅ Custom fuel type created: ${fuelType.name} (${fuelType.code})`);
  return fuelType;
}

/**
 * Delete a custom fuel type (only non-default fuel types can be deleted)
 */
export async function deleteFuelType(id: string): Promise<void> {
  const db = await getDatabase();

  const fuelType = await getFuelTypeById(id);
  if (!fuelType) {
    throw new Error('Tipo de combustível não encontrado');
  }

  if (fuelType.isDefault === 1) {
    throw new Error('Não é possível deletar combustíveis padrão do sistema');
  }

  // Check if there are any sales using this fuel type
  const salesCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sales WHERE fuelType = ?',
    [fuelType.code]
  );

  if (salesCount && salesCount.count > 0) {
    throw new Error(
      `Não é possível deletar este combustível pois existem ${salesCount.count} venda(s) registradas com ele`
    );
  }

  await db.runAsync('DELETE FROM fuel_types WHERE id = ?', [id]);

  console.log(`🗑️  Fuel type deleted: ${fuelType.name} (${id})`);
}

/**
 * Update the display order of fuel types (for drag-and-drop reordering)
 */
export async function updateFuelTypesOrder(orderedIds: string[]): Promise<void> {
  const db = await getDatabase();

  for (let i = 0; i < orderedIds.length; i++) {
    await db.runAsync(
      'UPDATE fuel_types SET displayOrder = ?, updatedAt = ? WHERE id = ?',
      [i + 1, new Date().toISOString(), orderedIds[i]]
    );
  }

  console.log('✅ Fuel types order updated');
}
