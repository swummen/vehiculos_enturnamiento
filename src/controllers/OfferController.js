// Offer Controller - Presentation Layer
const OfferService = require('../services/OfferService');

class OfferController {
  // POST /api/offers
  async createOffer(req, res) {
    try {
      const { conductor_id, vehicle_id, mensaje } = req.body;
      
      if (!conductor_id || !vehicle_id) {
        return res.status(400).json({
          success: false,
          message: 'conductor_id y vehicle_id son requeridos'
        });
      }

      const result = await OfferService.createOffer(req.user, {
        conductor_id, vehicle_id, mensaje
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Create offer error:', error);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
  }

  // GET /api/offers
  async getOffers(req, res) {
    try {
      const { estado } = req.query;
      const filters = {};
      if (estado) filters.estado = estado;

      const result = await OfferService.getOffers(req.user, filters);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get offers error:', error);
      res.status(500).json({ success: false, message: 'Error al obtener ofertas' });
    }
  }

  // PUT /api/offers/:id/respond
  async respondToOffer(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body;

      if (!action || !['aceptar', 'rechazar'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Acción requerida: aceptar o rechazar'
        });
      }

      const result = await OfferService.respondToOffer(req.user, id, action);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Respond offer error:', error);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
  }

  // GET /api/offers/hiring-history (for dispatcher)
  async getHiringHistory(req, res) {
    try {
      if (req.user.role !== 'despachador') {
        return res.status(403).json({
          success: false,
          message: 'Solo los despachadores pueden acceder al historial'
        });
      }

      const { estado, fecha_desde, fecha_hasta } = req.query;
      
      const filters = {};
      if (estado) filters.estado = estado;
      if (fecha_desde) filters.fecha_desde = fecha_desde;
      if (fecha_hasta) filters.fecha_hasta = fecha_hasta;

      const result = await OfferService.getHiringHistory(req.user.id, filters);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get hiring history error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener historial de contrataciones'
      });
    }
  }

  // GET /api/offers/available-drivers (for dispatcher hiring)
  async getAvailableDrivers(req, res) {
    try {
      if (req.user.role !== 'despachador') {
        return res.status(403).json({
          success: false,
          message: 'Solo los despachadores pueden acceder a esta información'
        });
      }

      const { ciudad, tipo_vehiculo } = req.query;
      
      const result = await OfferService.getAvailableDrivers(ciudad, tipo_vehiculo);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get available drivers error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener conductores disponibles'
      });
    }
  }
}

module.exports = new OfferController();