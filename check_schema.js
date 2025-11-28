const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  try {
    const pool = mysql.createPool({
      host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
      user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'enturnamiento',
      port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
      ssl:
        process.env.MYSQL_SSL === 'true' || process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
    });

    console.log('\n📊 VERIFICANDO ESQUEMA DE TABLAS EN RAILWAY\n');

    // Verificar columnas de routes
    const [routesColumns] = await pool.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'routes' AND TABLE_SCHEMA = ?
      ORDER BY ORDINAL_POSITION
    `, [process.env.MYSQLDATABASE || 'enturnamiento']);

    console.log('📋 COLUMNAS DE LA TABLA "routes":');
    if (routesColumns.length > 0) {
      routesColumns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.IS_NULLABLE === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
      });
    } else {
      console.log('  ❌ No se encontraron columnas (tabla no existe o está vacía)');
    }

    // Verificar ciudades
    const [citiesColumns] = await pool.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'cities' AND TABLE_SCHEMA = ?
      ORDER BY ORDINAL_POSITION
    `, [process.env.MYSQLDATABASE || 'enturnamiento']);

    console.log('\n📋 COLUMNAS DE LA TABLA "cities":');
    if (citiesColumns.length > 0) {
      citiesColumns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.IS_NULLABLE === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
      });
    } else {
      console.log('  ❌ No se encontraron columnas (tabla no existe)');
    }

    // Contar registros
    const [routeCount] = await pool.execute('SELECT COUNT(*) as count FROM routes');
    const [cityCount] = await pool.execute('SELECT COUNT(*) as count FROM cities');

    console.log(`\n📊 CONTEOS:`);
    console.log(`  - Rutas: ${routeCount[0].count}`);
    console.log(`  - Ciudades: ${cityCount[0].count}`);

    await pool.end();
    console.log('\n✅ Verificación completada\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema();
