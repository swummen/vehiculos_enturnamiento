// Authentication Middleware
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sistema_enturnamiento_secret_2024';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token requerido' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Token requerido'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

// Admin only middleware
const requireAdmin = requireRole(['administrador']);

// Dispatcher or Admin middleware
const requireDispatcherOrAdmin = requireRole(['despachador', 'administrador']);

// Conductor or Admin middleware
const requireConductorOrAdmin = requireRole(['conductor', 'administrador']);

// Allow authenticated users
const requireAuth = authenticateToken;

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireDispatcherOrAdmin,
  requireConductorOrAdmin,
  requireAuth
};