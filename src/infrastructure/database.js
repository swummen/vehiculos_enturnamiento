const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'enturnamiento',
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
  queueLimit: 0,
  ssl:
    process.env.MYSQL_SSL === 'true' || process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function healthCheck() {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
}

module.exports = { pool, query, healthCheck };