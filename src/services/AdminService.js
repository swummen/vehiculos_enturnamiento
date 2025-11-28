// Admin Service - Business Logic Layer
const UserRepository = require('../repositories/UserRepository');
const NotificationRepository = require('../repositories/NotificationRepository');
const OfferRepository = require('../repositories/OfferRepository');
const TripRepository = require('../repositories/TripRepository');

class AdminService {
  // Get all users with filters
  async getUsers(filters = {}) {
    try {
      const users = await UserRepository.findAll(filters);
      
      // Return users without passwords
      const safeUsers = users.map(user => user.toSafeObject());

      return {
        success: true,
        users: safeUsers,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener usuarios',
      };
    }
  }

  // Update user role
  async updateUserRole(adminId, userId, newRole) {
    try {
      // Validate role
      const rolesPermitidos = ['conductor', 'despachador', 'administrador'];
      if (!rolesPermitidos.includes(newRole)) {
        throw new Error('Rol no válido');
      }

      // Check if target user exists
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Update role
      await UserRepository.updateRole(userId, newRole);

      // Create notification for the user
      await NotificationRepository.create({
        user_id: userId,
        titulo: 'Rol actualizado',
        mensaje: `Tu rol ha sido actualizado a: ${newRole}`,
        tipo: 'info',
      });

      return {
        success: true,
        message: 'Rol actualizado correctamente',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Update user state
  async updateUserState(adminId, userId, newState) {
    try {
      // Validate state
      if (!['activo', 'inactivo'].includes(newState)) {
        throw new Error('Estado no válido');
      }

      // Check if target user exists
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Update state
      await UserRepository.updateState(userId, newState);

      // Create notification for the user
      await NotificationRepository.create({
        user_id: userId,
        titulo: 'Estado actualizado',
        mensaje: `Tu estado ha sido actualizado a: ${newState}`,
        tipo: 'info',
      });

      return {
        success: true,
        message: 'Estado actualizado correctamente',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get system logs
  async getSystemLogs() {
    // Make the logs endpoint tolerant: if one source fails, return partial results
    const result = { success: true, notifications: [], offers: [], trips: [], errors: [] };

    try {
      result.notifications = await NotificationRepository.getRecent(50);
    } catch (e) {
      console.error('Error loading notifications for admin logs:', e && e.message ? e.message : e);
      result.errors.push('notifications');
    }

    try {
      const offers = await OfferRepository.findAll({});
      result.offers = offers.slice(0, 50);
    } catch (e) {
      console.error('Error loading offers for admin logs:', e && e.message ? e.message : e);
      result.errors.push('offers');
    }

    try {
      const trips = await TripRepository.findAll({});
      result.trips = trips.slice(0, 50);
    } catch (e) {
      console.error('Error loading trips for admin logs:', e && e.message ? e.message : e);
      result.errors.push('trips');
    }

    // If all sources failed, report failure
    if (result.errors.length === 3) {
      return { success: false, message: 'Error al obtener logs del sistema' };
    }

    return result;
  }

  // Get system statistics
  async getSystemStatistics() {
    try {
      // Get user counts by role
      const [conductores, despachadores, administradores] = await Promise.all([
        UserRepository.findAll({ role: 'conductor' }),
        UserRepository.findAll({ role: 'despachador' }),
        UserRepository.findAll({ role: 'administrador' })
      ]);

      const statistics = {
        users: {
          total: conductores.length + despachadores.length + administradores.length,
          conductores: conductores.length,
          despachadores: despachadores.length,
          administradores: administradores.length,
        },
        // Additional statistics can be added here
        // like total vehicles, active trips, etc.
      };

      return {
        success: true,
        statistics,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener estadísticas del sistema',
      };
    }
  }

  // Create admin notification
  async createSystemNotification(adminId, notificationData) {
    try {
      const { user_id, titulo, mensaje, tipo } = notificationData;

      // Create notification
      await NotificationRepository.create({
        user_id,
        titulo,
        mensaje,
        tipo: tipo || 'info',
      });

      return {
        success: true,
        message: 'Notificación creada',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Broadcast notification to all users
  async broadcastNotification(adminId, notificationData) {
    try {
      const { titulo, mensaje, tipo } = notificationData;

      // Get all active users
      const users = await UserRepository.findAll({ estado: 'activo' });

      // Create notifications for all users
      const notifications = users.map(user => 
        NotificationRepository.create({
          user_id: user.id,
          titulo,
          mensaje,
          tipo: tipo || 'info',
        })
      );

      await Promise.all(notifications);

      return {
        success: true,
        message: 'Notificación enviada a todos los usuarios',
        recipientCount: users.length,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Validate admin permissions
  validateAdminPermissions(adminUser) {
    return adminUser.role === 'administrador';
  }
}

module.exports = new AdminService();