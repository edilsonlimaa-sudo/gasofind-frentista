import * as SQLite from 'expo-sqlite';

/**
 * Script para resetar o banco de dados
 * Execute com: npx tsx scripts/reset-db.ts
 * 
 * ATENÇÃO: Isso vai apagar TODOS os dados!
 */

const DATABASE_NAME = 'gasofind.db';

async function resetDB() {
  console.log('⚠️  RESETANDO BANCO DE DADOS - TODOS OS DADOS SERÃO PERDIDOS!');
  
  try {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    
    // Drop todas as tabelas
    await db.execAsync(`
      DROP TABLE IF EXISTS sales;
      DROP TABLE IF EXISTS shifts;
      DROP TABLE IF EXISTS fuel_types;
      DROP TABLE IF EXISTS station_status;
      PRAGMA user_version = 0;
    `);
    
    console.log('✅ Banco de dados resetado com sucesso!');
    console.log('📝 Na próxima vez que o app iniciar, as migrations serão aplicadas do zero.');
    
    await db.closeAsync();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao resetar banco:', error);
    process.exit(1);
  }
}

resetDB();
