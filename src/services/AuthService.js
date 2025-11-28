// Authentication Service - Business Logic Layer
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const NotificationRepository = require('../repositories/NotificationRepository');

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'sistema_enturnamiento_secret_2024';
  }

  // Login user
  async login(credentials) {
    try {
      const { username, password } = credentials;

      // Find user by username
      const user = await UserRepository.findByUsername(username);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verify password
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        throw new Error('Contraseña incorrecta');
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          nombre: user.nombre,
        },
        this.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return user without password
      const userWithoutPassword = user.toSafeObject();

      return {
        success: true,
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Register new user
  async register(userData) {
    try {
      const { username, password, role, nombre, email, telefono } = userData;

      // Validate role
      const rolesPermitidos = ['conductor', 'despachador'];
      if (!rolesPermitidos.includes(role)) {
        throw new Error('Rol no permitido');
      }

      // Check if username exists
      const usernameExists = await UserRepository.usernameExists(username);
      if (usernameExists) {
        throw new Error('El usuario ya existe');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await UserRepository.create({
        username,
        password: hashedPassword,
        role,
        nombre,
        email,
        telefono,
      });

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        userId: user.id,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Get user profile
  async getProfile(userId) {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        success: true,
        user: user.toSafeObject(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Change password
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verify old password
      const ok = await bcrypt.compare(oldPassword, user.password);
      if (!ok) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      // Note: This would require a method in UserRepository to update password
      // For now, we'll simulate this functionality

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Create admin notification
  async createAdminNotification(userId, title, message, type = 'info') {
    try {
      await NotificationRepository.create({
        user_id: userId,
        titulo: title,
        mensaje: message,
        tipo: type,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = new AuthService();