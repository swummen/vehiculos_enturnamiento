// Trip Controller - Presentation Layer
const TripService = require('../services/TripService');

class TripController {
  // GET /api/trips
  async getTrips(req, res) {
    try {
      const { estado } = req.query;
      
      const filters = {};
      if (estado) filters.estado = estado;

      const result = await TripService.getTrips(req.user, filters);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get trips error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener viajes'
      });
    }
  }

  // POST /api/trips
  async createTrip(req, res) {
    try {
      const { vehicle_id, origen, destino, carga, distancia_km, tiempo_estimado_horas } = req.body;

      if (!vehicle_id || !origen || !destino) {
        return res.status(400).json({
          success: false,
          message: 'Datos incompletos. Se requiere vehicle_id, origen y destino'
        });
      }

      const result = await TripService.createTrip(req.user, {
        vehicle_id,
        origen,
        destino,
        carga,
        distancia_km,
        tiempo_estimado_horas
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Create trip error:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor'
      });
    }
  }

  // PUT /api/trips/:id/finalize
  async finalizeTrip(req, res) {
    try {
      const { id } = req.params;

      const result = await TripService.finalizeTrip(req.user, id);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Finalize trip error:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor'
      });
    }
  }

  // PUT /api/trips/:id/status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Estado es requerido'
        });
      }

      const result = await TripService.updateStatus(req.user, id, status);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Update trip status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor'
      });
    }
  }

  // GET /api/trips/my-trips (for conductors)
  async getMyTrips(req, res) {
    try {
      const result = await TripService.getTrips(req.user, {});

      if (result.success) {
        // Filter trips for the current user if they're a conductor
        let filteredTrips = result.trips;
        if (req.user.role === 'conductor') {
          // This would need to be implemented in the service
          // For now, return all trips and let frontend filter if needed
        }
        res.json({ success: true, trips: filteredTrips });
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get my trips error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tus viajes'
      });
    }
  }

  // GET /api/trips/dispatcher/:dispatcherId (admin only)
  async getTripsByDispatcher(req, res) {
    try {
      // Only admin can view trips by specific dispatcher
      if (req.user.role !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden ver viajes por despachador'
        });
      }

      const { dispatcherId } = req.params;
      const result = await TripService.getTripsByDispatcher(dispatcherId);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get trips by dispatcher error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener viajes del despachador'
      });
    }
  }

  // GET /api/trips/vehicle/:vehicleId (admin only)
  async getTripsByVehicle(req, res) {
    try {
      // Only admin can view trips by specific vehicle
      if (req.user.role !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden ver viajes por vehículo'
        });
      }

      const { vehicleId } = req.params;
      const result = await TripService.getTripsByVehicle(vehicleId);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get trips by vehicle error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener viajes del vehículo'
      });
    }
  }
}

module.exports = new TripController();