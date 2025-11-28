// Vehicle Service - Business Logic Layer
const VehicleRepository = require('../repositories/VehicleRepository');
const UserRepository = require('../repositories/UserRepository');
const NotificationRepository = require('../repositories/NotificationRepository');

class VehicleService {
  // Get all vehicles with filters
  async getVehicles(user, filters = {}) {
    try {
      // Apply role-based filtering
      if (user.role === 'conductor') {
        filters.conductor_id = user.id;
      }

      const vehicles = await VehicleRepository.findAll(filters);

      return {
        success: true,
        vehicles: vehicles.map(vehicle => vehicle),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener vehículos',
      };
    }
  }

  // Get vehicles with location for map display
  async getVehiclesWithLocation(filters = {}) {
    try {
      const vehicles = await VehicleRepository.findAllWithLocation(filters);
      return {
        success: true,
        vehicles: vehicles,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener vehículos con ubicación',
      };
    }
  }

  // Register new vehicle
  async registerVehicle(user, vehicleData) {
    try {
      // Only conductors can register vehicles
      if (user.role !== 'conductor') {
        throw new Error('Solo los conductores pueden registrar vehículos');
      }

      const { placa, tipo_vehiculo, tipo_carroceria, ciudad_origen, destino_preferente } = vehicleData;

      // Validate vehicle data
      if (!placa || !tipo_vehiculo || !tipo_carroceria || !ciudad_origen) {
        throw new Error('Datos del vehículo incompletos');
      }

      // Check if plate already exists
      const plateExists = await VehicleRepository.plateExists(placa);
      if (plateExists) {
        throw new Error('La placa ya está registrada');
      }

      // Create vehicle
      const vehicle = await VehicleRepository.create({
        placa,
        tipo_vehiculo,
        tipo_carroceria,
        ciudad_origen,
        destino_preferente,
        conductor_id: user.id,
      });

      return {
        success: true,
        message: 'Vehículo registrado correctamente',
        vehicleId: vehicle.id,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Update vehicle status
  async updateStatus(user, vehicleId, status) {
    try {
      // Validate status
      const estadosPermitidos = ['Disponible', 'En viaje', 'Mantenimiento'];
      if (!estadosPermitidos.includes(status)) {
        throw new Error('Estado no válido');
      }

      // Find vehicle
      const vehicle = await VehicleRepository.findById(vehicleId);
      if (!vehicle) {
        throw new Error('Vehículo no encontrado');
      }

      // Check permissions
      if (user.role === 'conductor' && !vehicle.belongsToConductor(user.id)) {
        throw new Error('No puedes actualizar vehículos de otros conductores');
      }

      // Update status
      await VehicleRepository.updateStatus(vehicleId, status);

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

  // Update vehicle location
  async updateLocation(user, vehicleId, lat, lng) {
    try {
      // Find vehicle
      const vehicle = await VehicleRepository.findById(vehicleId);
      if (!vehicle) {
        throw new Error('Vehículo no encontrado');
      }

      // Only conductor can update their own vehicle location
      if (!vehicle.belongsToConductor(user.id)) {
        throw new Error('No puedes actualizar la ubicación de este vehículo');
      }

      // Update location
      await VehicleRepository.updateLocation(vehicleId, lat, lng);

      return {
        success: true,
        message: 'Ubicación actualizada correctamente',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get available vehicles
  async getAvailableVehicles() {
    try {
      const vehicles = await VehicleRepository.findAvailable();
      return {
        success: true,
        vehicles,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener vehículos disponibles',
      };
    }
  }

  // Get vehicles by conductor
  async getVehiclesByConductor(conductorId) {
    try {
      const vehicles = await VehicleRepository.findByConductor(conductorId);
      return {
        success: true,
        vehicles,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener vehículos del conductor',
      };
    }
  }

  // Get available drivers with their vehicles (for dispatcher)
  async getAvailableDrivers(city = null, vehicleType = null) {
    try {
      const vehicles = await VehicleRepository.findAvailableWithDrivers(city, vehicleType);
      return {
        success: true,
        vehicles,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener conductores disponibles',
      };
    }
  }

  // Check if user can access vehicle
  canAccessVehicle(user, vehicle) {
    if (user.role === 'administrador') return true;
    if (user.role === 'despachador') return true;
    if (user.role === 'conductor') return vehicle.belongsToConductor(user.id);
    return false;
  }
}

module.exports = new VehicleService();