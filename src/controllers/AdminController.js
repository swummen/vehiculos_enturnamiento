// Admin Controller - Presentation Layer
const AdminService = require('../services/AdminService');

class AdminController {
  // GET /api/users
  async getUsers(req, res) {
    try {
      const { role, estado } = req.query;
      const filters = {};
      if (role) filters.role = role;
      if (estado) filters.estado = estado;

      const result = await AdminService.getUsers(filters);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
  }

  // PUT /api/users/:id/role
  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'role is required'
        });
      }

      const result = await AdminService.updateUserRole(req.user.id, id, role);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
  }

  // PUT /api/users/:id/state
  async updateUserState(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado) {
        return res.status(400).json({
          success: false,
          message: 'estado is required'
        });
      }

      const result = await AdminService.updateUserState(req.user.id, id, estado);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Update user state error:', error);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
  }

  // GET /api/admin/logs
  async getSystemLogs(req, res) {
    try {
      const result = await AdminService.getSystemLogs();

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get system logs error:', error);
      res.status(500).json({ success: false, message: 'Error al obtener logs' });
    }
  }

  // GET /api/admin/statistics
  async getSystemStatistics(req, res) {
    try {
      const result = await AdminService.getSystemStatistics();

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get system statistics error:', error);
      res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
    }
  }
}

module.exports = new AdminController();