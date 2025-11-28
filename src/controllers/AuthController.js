// Authentication Controller - Presentation Layer
const AuthService = require('../services/AuthService');

class AuthController {
  // POST /api/login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username y password son requeridos'
        });
      }

      const result = await AuthService.login({ username, password });

      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor'
      });
    }
  }

  // POST /api/register
  async register(req, res) {
    try {
      const { username, password, role, nombre, email, telefono } = req.body;

      if (!username || !password || !role || !nombre) {
        return res.status(400).json({
          success: false,
          message: 'Datos incompletos. Se requiere username, password, role y nombre'
        });
      }

      const result = await AuthService.register({
        username,
        password,
        role,
        nombre,
        email,
        telefono
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor'
      });
    }
  }

  // GET /api/users/me
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const result = await AuthService.getProfile(userId);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor'
      });
    }
  }

  // PUT /api/users/me/password
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password actual y nuevo password son requeridos'
        });
      }

      const result = await AuthService.changePassword(userId, oldPassword, newPassword);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor'
      });
    }
  }
}

module.exports = new AuthController();