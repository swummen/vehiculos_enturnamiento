const { query } = require('../src/infrastructure/database');

async function ensure() {
  try {
    console.log('Ensuring offers table exists and has trip_id...');

    // Create offers table if it does not exist (safe for new DBs)
    await query(`CREATE TABLE IF NOT EXISTS offers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      despachador_id INT NOT NULL,
      conductor_id INT NOT NULL,
      vehicle_id INT NOT NULL,
      mensaje TEXT,
      estado ENUM('enviado','aceptado','rechazado') DEFAULT 'enviado',
      trip_id INT NULL,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Add trip_id column if missing
    const cols = await query("SHOW COLUMNS FROM offers LIKE 'trip_id'");
    if (!cols || cols.length === 0) {
      await query('ALTER TABLE offers ADD COLUMN trip_id INT NULL');
      console.log('Added offers.trip_id');
    } else {
      console.log('offers.trip_id already exists');
    }

    // Ensure notifications table has an offer_id column (used to link notifications to offers)
    console.log('Ensuring notifications table has offer_id...');
    await query(`CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      titulo VARCHAR(100) NOT NULL,
      mensaje TEXT NOT NULL,
      tipo ENUM('info','warning','error') DEFAULT 'info',
      leida BOOLEAN DEFAULT FALSE,
      accion VARCHAR(255),
      offer_id INT NULL,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    const ncols = await query("SHOW COLUMNS FROM notifications LIKE 'offer_id'");
    if (!ncols || ncols.length === 0) {
      await query('ALTER TABLE notifications ADD COLUMN offer_id INT NULL');
      console.log('Added notifications.offer_id');
    } else {
      console.log('notifications.offer_id already exists');
    }

    console.log('Schema ensure complete');
  } catch (err) {
    console.error('Schema ensure failed:', err.message || err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

ensure();
