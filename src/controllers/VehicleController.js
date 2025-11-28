// Vehicle Controller - Presentation Layer
const VehicleService = require('../services/VehicleService');

class VehicleController {
  // GET /api/vehicles
  async getVehicles(req, res) {
    try {
      const { estado, ciudad, tipo_vehiculo, tipo_carroceria } = req.query;
      
      const filters = {};
      if (estado) filters.estado = estado;
      if (ciudad) filters.ciudad = ciudad;
      if (tipo_vehiculo) filters.tipo_vehiculo = tipo_vehiculo;
      if (tipo_carroceria) filters.tipo_carroceria = tipo_carroceria;

      const result = await VehicleService.getVehicles(req.user, filters);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener vehículos'
      });
    }
  }

  // POST /api/vehicles
  async registerVehicle(req, res) {
    try {
      const { placa, tipo_vehiculo, tipo_carroceria, ciudad_origen, destino_preferente } = req.body;

      if (!placa || !tipo_vehiculo || !tipo_carroceria || !ciudad_origen) {
        return res.status(400).json({
          success: false,
          message: 'Datos incompletos. Se requiere placa, tipo_vehiculo, tipo_carroceria y ciudad_origen'
        });
      }

      const result = await VehicleService.registerVehicle(req.user, {
        placa,
        tipo_vehiculo,
        tipo_carroceria,
        ciudad_origen,
        destino_preferente
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Register vehicle error:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor'
      });
    }
  }

  // PUT /api/vehicles/:id/status
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

      const result = await VehicleService.updateStatus(req.user, id, status);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Update vehicle status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor'
      });
    }
  }

  // PUT /api/vehicles/:id/location
  async updateLocation(req, res) {
    try {
      const { id } = req.params;
      const { lat, lng } = req.body;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitud y longitud son requeridas'
        });
      }

      const result = await VehicleService.updateLocation(req.user, id, lat, lng);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Update vehicle location error:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor'
      });
    }
  }

  // GET /api/vehicles/available
  async getAvailableVehicles(req, res) {
    try {
      const result = await VehicleService.getAvailableVehicles();

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get available vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener vehículos disponibles'
      });
    }
  }

  // GET /api/vehicles/my-vehicles (for conductors)
  async getMyVehicles(req, res) {
    try {
      if (req.user.role !== 'conductor') {
        return res.status(403).json({
          success: false,
          message: 'Solo los conductores pueden acceder a sus vehículos'
        });
      }

      const result = await VehicleService.getVehiclesByConductor(req.user.id);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get my vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener tus vehículos'
      });
    }
  }

  // GET /api/vehicles/map-view (for dispatcher map view)
  async getVehiclesForMap(req, res) {
    try {
      const { ciudad, tipo_vehiculo, tipo_carroceria } = req.query;
      
      const filters = {};
      if (ciudad) filters.ciudad_origen = ciudad;
      if (tipo_vehiculo) filters.tipo_vehiculo = tipo_vehiculo;
      if (tipo_carroceria) filters.tipo_carroceria = tipo_carroceria;

      const result = await VehicleService.getVehiclesWithLocation(filters);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get vehicles for map error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener vehículos para mapa'
      });
    }
  }

  // GET /api/vehicles/available-drivers (for dispatcher hiring)
  async getAvailableDrivers(req, res) {
    try {
      const { ciudad, tipo_vehiculo } = req.query;
      
      const result = await VehicleService.getAvailableDrivers(ciudad, tipo_vehiculo);

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

module.exports = new VehicleController();