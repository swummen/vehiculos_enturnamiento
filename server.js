// server.js - Layered Architecture Implementation

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import infrastructure
const { healthCheck } = require('./src/infrastructure/database');

// Import middleware
const { authenticateToken } = require('./src/middleware/auth');

// Import controllers
const AuthController = require('./src/controllers/AuthController');
const VehicleController = require('./src/controllers/VehicleController');
const TripController = require('./src/controllers/TripController');
const OfferController = require('./src/controllers/OfferController');
const ChatController = require('./src/controllers/ChatController');
const AdminController = require('./src/controllers/AdminController');

// Configuración básica
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sistema_enturnamiento_secret_2024';

// Orígenes permitidos (CORS)
const allowedOrigins = [
  'https://vehiculos-enturnamiento.vercel.app',    // Frontend en Vercel
  'https://vehiculos-enturnamiento.onrender.com',  // Backend (por si hace requests a sí mismo)
  'http://localhost:3000',                         // Desarrollo local
  'http://127.0.0.1:3000'
];

// Initialize Express app
const app = express();
const server = http.createServer(app);

// ===============================
// CORS MIDDLEWARE CORRECTO
// ===============================
app.use(cors({
  origin: function (origin, callback) {
    // Permite llamadas sin origin (curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log('❌ CORS bloqueado para origen:', origin);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Para preflight OPTIONS
app.options('*', cors());

// JSON y archivos estáticos
app.use(express.json());
app.use(express.static('public')); // Serve frontend files from public directory

// Map userId -> socket id for real-time chat
const connectedUsers = new Map();

// ===============================
// SOCKET.IO - con CORS correcto
// ===============================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

// ===============================
// RUTAS HTTP
// ===============================

// Health check
app.get('/api/status', async (req, res) => {
  const ok = await healthCheck();
  if (!ok) {
    return res.status(500).json({
      success: false,
      message: 'Servidor OK, pero la base de datos NO responde',
      timestamp: new Date().toISOString(),
    });
  }
  res.json({
    success: true,
    message: 'Servidor y base de datos OK',
    timestamp: new Date().toISOString(),
  });
});

// Get public config (without sensitive data)
app.get('/api/config', (req, res) => {
  res.json({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
  });
});

// Authentication routes (no auth required)
app.post('/api/login', AuthController.login);
app.post('/api/register', AuthController.register);

// Protected routes (auth required)
app.get('/api/users/me', authenticateToken, AuthController.getProfile);

// Vehicle routes - IMPORTANT: Place specific routes BEFORE parameterized routes
app.get('/api/vehicles/available', authenticateToken, VehicleController.getAvailableVehicles);
app.get('/api/vehicles/my-vehicles', authenticateToken, VehicleController.getMyVehicles);
app.get('/api/vehicles/map-view', authenticateToken, VehicleController.getVehiclesForMap);
app.get('/api/vehicles/available-drivers', authenticateToken, VehicleController.getAvailableDrivers);
app.get('/api/vehicles', authenticateToken, VehicleController.getVehicles);
app.post('/api/vehicles', authenticateToken, VehicleController.registerVehicle);
app.put('/api/vehicles/:id/status', authenticateToken, VehicleController.updateStatus);
app.put('/api/vehicles/:id/location', authenticateToken, VehicleController.updateLocation);

// Trip routes - IMPORTANT: Place specific routes BEFORE parameterized routes
app.get('/api/trips/my-trips', authenticateToken, TripController.getMyTrips);
app.get('/api/trips', authenticateToken, TripController.getTrips);
app.post('/api/trips', authenticateToken, TripController.createTrip);
app.put('/api/trips/:id/finalize', authenticateToken, TripController.finalizeTrip);
app.put('/api/trips/:id/status', authenticateToken, TripController.updateStatus);

// Offer routes - IMPORTANT: Place specific routes BEFORE parameterized routes
app.get('/api/offers/hiring-history', authenticateToken, OfferController.getHiringHistory);
app.get('/api/offers/available-drivers', authenticateToken, OfferController.getAvailableDrivers);
app.get('/api/offers', authenticateToken, OfferController.getOffers);
app.post('/api/offers', authenticateToken, OfferController.createOffer);
app.put('/api/offers/:id/respond', authenticateToken, OfferController.respondToOffer);

// Chat routes
app.get('/api/chats/conversations', authenticateToken, ChatController.getConversations);
app.get('/api/chats', authenticateToken, ChatController.getConversation);
app.post('/api/chats', authenticateToken, ChatController.sendMessage);
app.get('/api/users/search', authenticateToken, ChatController.searchUsers);
app.get('/api/users/:id', authenticateToken, ChatController.getUserById);

// Admin routes
app.get('/api/users', authenticateToken, AdminController.getUsers);
app.put('/api/users/:id/role', authenticateToken, AdminController.updateUserRole);
app.put('/api/users/:id/state', authenticateToken, AdminController.updateUserState);
app.get('/api/admin/logs', authenticateToken, AdminController.getSystemLogs);
app.get('/api/admin/statistics', authenticateToken, AdminController.getSystemStatistics);

app.get('/api/admin/cities', authenticateToken, async (req, res) => {
  try {
    const { query } = require('./src/infrastructure/database');
    const rows = await query('SELECT id, nombre, departamento, codigo FROM cities WHERE estado = "activa" ORDER BY nombre ASC');
    res.json({ success: true, cities: rows || [] });
  } catch (err) {
    console.error('GET /api/admin/cities error', err);
    res.status(500).json({ success: false, message: 'Error al obtener ciudades' });
  }
});

app.post('/api/admin/cities', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('./src/infrastructure/database');
    const { nombre, departamento, codigo } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO cities (nombre, departamento, codigo, estado) VALUES (?, ?, ?, "activa")',
      [nombre, departamento || null, codigo || null]
    );
    return res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('POST /api/admin/cities error', err);
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Ya existe una ciudad con ese código' });
    }
    res.status(500).json({ success: false, message: err.message || 'Error al crear ciudad' });
  }
});

app.put('/api/admin/cities/:id', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('./src/infrastructure/database');
    const { id } = req.params;
    const { nombre, departamento, codigo } = req.body;
    await pool.execute(
      'UPDATE cities SET nombre = ?, departamento = ?, codigo = ? WHERE id = ?',
      [nombre, departamento || null, codigo || null, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/admin/cities/:id error', err);
    res.status(500).json({ success: false, message: 'Error al actualizar ciudad' });
  }
});

app.delete('/api/admin/cities/:id', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('./src/infrastructure/database');
    const { id } = req.params;
    await pool.execute('UPDATE cities SET estado = "inactiva" WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/cities/:id error', err);
    res.status(500).json({ success: false, message: 'Error al eliminar ciudad' });
  }
});

// Routes CRUD
app.get('/api/admin/routes', authenticateToken, async (req, res) => {
  try {
    const { query } = require('./src/infrastructure/database');
    const rows = await query(`
      SELECT r.id, r.ciudad_origen_id, r.ciudad_destino_id, r.distancia_km, r.tiempo_estimado_horas, r.estado,
             co.nombre AS ciudad_origen, cd.nombre AS ciudad_destino
      FROM routes r
      LEFT JOIN cities co ON r.ciudad_origen_id = co.id
      LEFT JOIN cities cd ON r.ciudad_destino_id = cd.id
      WHERE r.estado = 'activa'
      ORDER BY r.id DESC
    `);
    res.json({ success: true, routes: rows || [] });
  } catch (err) {
    console.error('GET /api/admin/routes error', err);
    res.status(500).json({ success: false, message: 'Error al obtener rutas' });
  }
});

app.post('/api/admin/routes', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('./src/infrastructure/database');
    const { ciudad_origen_id, ciudad_destino_id, distancia, tiempo } = req.body;
    console.log('POST /api/admin/routes body:', req.body);

    if (!ciudad_origen_id || !ciudad_destino_id) {
      return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }

    if (String(ciudad_origen_id) === String(ciudad_destino_id)) {
      return res.status(400).json({ success: false, message: 'Origen y destino no pueden ser la misma ciudad' });
    }

    const distanciaValue = (typeof distancia === 'number' || !isNaN(Number(distancia))) ? Number(distancia) : 0;
    const tiempoValue = (typeof tiempo === 'number' || !isNaN(Number(tiempo))) ? Number(tiempo) : 0;

    const [result] = await pool.execute(
      'INSERT INTO routes (ciudad_origen_id, ciudad_destino_id, distancia_km, tiempo_estimado_horas, estado, fecha_creacion) VALUES (?, ?, ?, ?, "activa", NOW())',
      [ciudad_origen_id, ciudad_destino_id, distanciaValue, tiempoValue]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('POST /api/admin/routes error', err);
    if (err && err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, message: 'Ciudad origen o destino no existe' });
    }
    res.status(500).json({ success: false, message: err.message || 'Error al crear ruta' });
  }
});

app.put('/api/admin/routes/:id', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('./src/infrastructure/database');
    const { id } = req.params;
    const { ciudad_origen_id, ciudad_destino_id, distancia, tiempo } = req.body;
    
    if (ciudad_origen_id === ciudad_destino_id) {
      return res.status(400).json({ success: false, message: 'Origen y destino no pueden ser la misma ciudad' });
    }

    await pool.execute(
      'UPDATE routes SET ciudad_origen_id = ?, ciudad_destino_id = ?, distancia_km = ?, tiempo_estimado_horas = ? WHERE id = ?',
      [ciudad_origen_id, ciudad_destino_id, distancia || 0, tiempo || 0, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/admin/routes/:id error', err);
    if (err && err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, message: 'Ciudad origen o destino no existe' });
    }
    res.status(500).json({ success: false, message: err.message || 'Error al actualizar ruta' });
  }
});

app.delete('/api/admin/routes/:id', authenticateToken, async (req, res) => {
  try {
    const { pool } = require('./src/infrastructure/database');
    const { id } = req.params;
    await pool.execute('UPDATE routes SET estado = "inactiva" WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/routes/:id error', err);
    res.status(500).json({ success: false, message: 'Error al eliminar ruta' });
  }
});

// SOCKET.IO - REAL-TIME CHAT
io.on('connection', (socket) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return; // don't register anonymous sockets

  // Verify token and get user info
  const jwt = require('jsonwebtoken');
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return;
    
    // store mapping
    connectedUsers.set(user.id, socket.id);
    console.log('Socket connected for user', user.id);

    socket.on('private_message', async (msg) => {
      try {
        const { toUserId, message, offerId } = msg;
        
        // Create message through the service layer
        const MessageRepository = require('./src/repositories/MessageRepository');
        const { pool } = require('./src/infrastructure/database');
        
        const [insertResult] = await pool.execute(
          'INSERT INTO messages (`from_user`,`to_user`,`message`,`offer_id`) VALUES (?, ?, ?, ?)',
          [user.id, toUserId, message, offerId || null]
        );
        const messageId = insertResult && insertResult.insertId ? insertResult.insertId : null;

        // forward to recipient if connected
        const sid = connectedUsers.get(Number(toUserId));
        const payload = { 
          id: messageId, 
          from: user.id, 
          from_name: user.nombre || user.username || null, 
          to: Number(toUserId), 
          message, 
          offerId, 
          created_at: new Date() 
        };
        if (sid) io.to(sid).emit('private_message', payload);
        
        // also ack back to sender
        socket.emit('private_message_sent', payload);
      } catch (e) {
        console.error('Error persisting private_message', e);
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(user.id);
      console.log('Socket disconnected for user', user.id);
    });
  });
});

// ===============================
// DATABASE INITIALIZATION
// ===============================
async function initializeDatabase() {
  try {
    const { query, pool } = require('./src/infrastructure/database');
    const bcrypt = require('bcrypt');

    // Create tables if they don't exist (simplified version)
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('conductor','despachador','administrador') NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        telefono VARCHAR(30),
        estado ENUM('activo','inactivo') DEFAULT 'activo',
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cities and routes tables (admin panel)
    await query(`
      CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        departamento VARCHAR(150) DEFAULT NULL,
        codigo VARCHAR(20) DEFAULT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS routes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ciudad_origen_id INT NOT NULL,
        ciudad_destino_id INT NOT NULL,
        distancia_km DECIMAL(10,2) DEFAULT 0,
        tiempo_estimado_horas DECIMAL(10,2) DEFAULT 0,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ciudad_origen_id) REFERENCES cities(id) ON DELETE SET NULL,
        FOREIGN KEY (ciudad_destino_id) REFERENCES cities(id) ON DELETE SET NULL
      )
    `);

    // Create default admin user
    try {
      const admins = await query('SELECT id FROM users WHERE username = ?', ['admin']);
      if (!admins || admins.length === 0) {
        const plainPassword = '123';
        const hashed = await bcrypt.hash(plainPassword, 10);
        const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
        const nombre = `Administrador ${randomSuffix}`;
        const email = `admin+${randomSuffix}@example.com`;
        const telefono = `+57 300${Math.floor(Math.random() * 9000000) + 1000000}`;

        await pool.execute(
          `INSERT INTO users (username, password, role, nombre, email, telefono, estado)
           VALUES (?, ?, 'administrador', ?, ?, ?, 'activo')`,
          ['admin', hashed, nombre, email, telefono]
        );

        console.log('Usuario administrador creado (username: admin, password: 123)');
      }
    } catch (seedErr) {
      console.error('Error al crear usuario admin por defecto:', seedErr.message || seedErr);
    }

    console.log('Base de datos inicializada correctamente');
  } catch (err) {
    console.error('Error inicializando base de datos:', err);
    throw err;
  }
}

// ===============================
// SERVER STARTUP
// ===============================
initializeDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Servidor API ejecutándose en http://localhost:${PORT}`);
      console.log(`📊 Arquitectura en capas activada`);
      console.log(`🗄️ Base de datos: MySQL`);
    });
  })
  .catch((err) => {
    console.error('❌ No se pudo inicializar la base de datos. Cerrando servidor.');
    process.exit(1);
  });