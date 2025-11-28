const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

async function initializeDatabase() {
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

    console.log('\n🔧 CREANDO TABLA "routes"\n');

    const createRoutesSQL = `
      CREATE TABLE IF NOT EXISTS routes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ciudad_origen_id INT NOT NULL,
          ciudad_destino_id INT NOT NULL,
          distancia_km DECIMAL(10,2),
          tiempo_estimado_horas DECIMAL(10,2),
          estado ENUM('activa','inactiva') DEFAULT 'activa',
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_routes_origen FOREIGN KEY (ciudad_origen_id) REFERENCES cities(id),
          CONSTRAINT fk_routes_destino FOREIGN KEY (ciudad_destino_id) REFERENCES cities(id)
      )
    `;

    await pool.execute(createRoutesSQL);
    console.log('✅ Tabla "routes" creada exitosamente\n');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

initializeDatabase();
