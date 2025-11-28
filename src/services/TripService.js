// Trip Service - Business Logic Layer
const TripRepository = require('../repositories/TripRepository');
const VehicleRepository = require('../repositories/VehicleRepository');
const NotificationRepository = require('../repositories/NotificationRepository');
const UserRepository = require('../repositories/UserRepository');

class TripService {
  // Get all trips with filters
  async getTrips(user, filters = {}) {
    try {
      // Apply role-based filtering
      if (user.role === 'conductor') {
        // Get trips for vehicles owned by conductor (support multiple vehicles)
        const vehicles = await VehicleRepository.findByConductor(user.id);
        const vehicleIds = vehicles.map(v => v.id);
        if (vehicleIds.length > 0) {
          filters.vehicle_id = vehicleIds; // pass array to repository which supports IN clause
        }
      } else if (user.role === 'despachador') {
        filters.despachador_id = user.id;
      }

      const trips = await TripRepository.findAll(filters);

      return {
        success: true,
        trips,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener viajes',
      };
    }
  }

  // Create new trip
  async createTrip(user, tripData) {
    try {
      // Only despachadores can create trips
      if (user.role !== 'despachador') {
        throw new Error('Solo los despachadores pueden crear viajes');
      }

      const { vehicle_id, origen, destino, carga, distancia_km, tiempo_estimado_horas } = tripData;

      // Validate trip data
      if (!vehicle_id || !origen || !destino) {
        throw new Error('Datos del viaje incompletos');
      }

      // Check if vehicle exists and is available
      const vehicle = await VehicleRepository.findById(vehicle_id);
      if (!vehicle) {
        throw new Error('Vehículo no encontrado');
      }
      
      if (!vehicle.isAvailable()) {
        throw new Error('El vehículo no está disponible');
      }

      // Create trip
      const trip = await TripRepository.create({
        vehicle_id,
        despachador_id: user.id,
        origen,
        destino,
        carga,
        distancia_km,
        tiempo_estimado_horas,
      });

      // Update vehicle status to "En viaje"
      await VehicleRepository.updateStatus(vehicle_id, 'En viaje');

      // Create notification for conductor
      const conductor = await UserRepository.findById(vehicle.conductor_id);
      if (conductor) {
        await NotificationRepository.create({
          user_id: conductor.id,
          titulo: 'Nuevo viaje asignado',
          mensaje: `Se te ha asignado un nuevo viaje de ${origen} a ${destino}`,
          tipo: 'info',
        });
      }

      return {
        success: true,
        message: 'Viaje creado correctamente',
        tripId: trip.id,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Finalize trip
  async finalizeTrip(user, tripId) {
    try {
      // Find trip
      const trip = await TripRepository.findById(tripId);
      if (!trip) {
        throw new Error('Viaje no encontrado');
      }

      // Check permissions (admin, the dispatcher who created the trip, or the conductor assigned to the vehicle)
      let hasPermission = user.role === 'administrador' || trip.belongsToDispatcher(user.id);
      if (!hasPermission && user.role === 'conductor') {
        // verify conductor owns the vehicle for this trip
        // TripRepository.findById includes conductor_id (added in repository)
        hasPermission = trip.conductor_id && String(trip.conductor_id) === String(user.id);
      }
      
      if (!hasPermission) {
        throw new Error('No tienes permisos para finalizar este viaje');
      }

      // Finalize trip
      await TripRepository.finalize(tripId);

      // Update vehicle status to "Disponible"
      await VehicleRepository.updateStatus(trip.vehicle_id, 'Disponible');

      // Notify the dispatcher who created the trip (if someone else finalized it)
      const dispatcher = await UserRepository.findById(trip.despachador_id);
      if (dispatcher && Number(user.id) !== Number(dispatcher.id)) {
        await NotificationRepository.create({
          user_id: dispatcher.id,
          titulo: 'Viaje finalizado',
          mensaje: `El viaje de ${trip.origen} a ${trip.destino} ha sido finalizado`,
          tipo: 'info',
        });
      }

      return {
        success: true,
        message: 'Viaje finalizado correctamente',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Update trip status
  async updateStatus(user, tripId, status) {
    try {
      // Validate status
      const estadosPermitidos = ['En curso', 'Finalizado', 'Completado'];
      if (!estadosPermitidos.includes(status)) {
        throw new Error('Estado no válido');
      }

      // Find trip
      const trip = await TripRepository.findById(tripId);
      if (!trip) {
        throw new Error('Viaje no encontrado');
      }

      // Check permissions
      let hasPermission = user.role === 'administrador' || trip.belongsToDispatcher(user.id);
      if (!hasPermission && user.role === 'conductor') {
        // verify conductor owns the vehicle for this trip
        hasPermission = trip.conductor_id && Number(trip.conductor_id) === Number(user.id);
      }
      
      if (!hasPermission) {
        throw new Error('No tienes permisos para actualizar este viaje');
      }

      // Update status
      await TripRepository.updateStatus(tripId, status);

      return {
        success: true,
        message: 'Estado del viaje actualizado correctamente',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get trips by dispatcher
  async getTripsByDispatcher(dispatcherId) {
    try {
      const trips = await TripRepository.findByDispatcher(dispatcherId);
      return {
        success: true,
        trips,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener viajes del despachador',
      };
    }
  }

  // Get trips by vehicle
  async getTripsByVehicle(vehicleId) {
    try {
      const trips = await TripRepository.findByVehicle(vehicleId);
      return {
        success: true,
        trips,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener viajes del vehículo',
      };
    }
  }
}

module.exports = new TripService();