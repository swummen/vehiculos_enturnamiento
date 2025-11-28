const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixRoutesTable() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'railway',
      port: Number(process.env.DB_PORT || 3306),
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });

    console.log('\n🔧 REPARANDO TABLA "routes"\n');

    // Verificar si existen las columnas
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'routes' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'railway']);

    const columnNames = columns.map(c => c.COLUMN_NAME);
    console.log('Columnas actuales:', columnNames);

    // Agregar columnas faltantes
    if (!columnNames.includes('distancia_km')) {
      console.log('  ⏳ Agregando columna distancia_km...');
      await pool.execute('ALTER TABLE routes ADD COLUMN distancia_km DECIMAL(10,2) DEFAULT 0');
      console.log('  ✅ distancia_km agregada');
    }

    if (!columnNames.includes('tiempo_estimado_horas')) {
      console.log('  ⏳ Agregando columna tiempo_estimado_horas...');
      await pool.execute('ALTER TABLE routes ADD COLUMN tiempo_estimado_horas DECIMAL(10,2) DEFAULT 0');
      console.log('  ✅ tiempo_estimado_horas agregada');
    }

    if (!columnNames.includes('estado')) {
      console.log('  ⏳ Agregando columna estado...');
      await pool.execute("ALTER TABLE routes ADD COLUMN estado ENUM('activa','inactiva') DEFAULT 'activa'");
      console.log('  ✅ estado agregada');
    }

    console.log('\n✅ Tabla "routes" reparada exitosamente\n');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixRoutesTable();
