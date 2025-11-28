// Offer Service - Business Logic Layer
const OfferRepository = require('../repositories/OfferRepository');
const TripRepository = require('../repositories/TripRepository');
const VehicleRepository = require('../repositories/VehicleRepository');
const NotificationRepository = require('../repositories/NotificationRepository');

class OfferService {
  // Create new offer
  async createOffer(user, offerData) {
    try {
      // Only despachadores can create offers
      if (user.role !== 'despachador') {
        throw new Error('Solo los despachadores pueden enviar ofertas');
      }

      const { conductor_id, vehicle_id, mensaje } = offerData;

      // Validate offer data
      if (!conductor_id || !vehicle_id) {
        throw new Error('Datos de la oferta incompletos');
      }

      // Check if vehicle exists and belongs to conductor
      const vehicle = await VehicleRepository.findById(vehicle_id);
      if (!vehicle) {
        throw new Error('Vehículo no encontrado');
      }
      
      if (vehicle.conductor_id !== conductor_id) {
        throw new Error('El vehículo no pertenece al conductor especificado');
      }

      // Create offer
      const offer = await OfferRepository.create({
        despachador_id: user.id,
        conductor_id,
        vehicle_id,
        mensaje,
      });

      // Create notification for conductor
      await NotificationRepository.create({
        user_id: conductor_id,
        titulo: 'Nueva oferta de contratación',
        mensaje: `Has recibido la oferta #${offer.id} para el vehículo ${vehicle.placa}` + (mensaje ? `: ${mensaje}` : ''),
        tipo: 'info',
        offer_id: offer.id,
      });

      return {
        success: true,
        message: 'Oferta enviada',
        offerId: offer.id,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get offers with filters for dispatcher
  async getOffers(user, filters = {}) {
    try {
      // Apply role-based filtering
      if (user.role === 'conductor') {
        filters.conductor_id = user.id;
      } else if (user.role === 'despachador') {
        filters.despachador_id = user.id;
      }

      const offers = await OfferRepository.findAll(filters);

      return {
        success: true,
        offers,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener ofertas',
      };
    }
  }

  // Get hiring history for dispatcher
  async getHiringHistory(dispatcherId, filters = {}) {
    try {
      const offers = await OfferRepository.findByDispatcherWithDetails(dispatcherId, filters);
      return {
        success: true,
        offers,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener historial de contrataciones',
      };
    }
  }

  // Get available drivers with their vehicles
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

  // Respond to offer (accept or reject)
  async respondToOffer(user, offerId, action) {
    try {
      // Only conductores can respond to offers
      if (user.role !== 'conductor') {
        throw new Error('Solo los conductores pueden responder ofertas');
      }

      // Validate action
      if (!['aceptar', 'rechazar'].includes(action)) {
        throw new Error('Acción inválida');
      }

      // Find offer
      const offer = await OfferRepository.findById(offerId);
      if (!offer) {
        throw new Error('Oferta no encontrada');
      }

      // Check if conductor can respond to this offer
      if (!offer.canBeRespondedBy(user.id)) {
        throw new Error('No puedes responder esta oferta');
      }

      let createdTripId = null;

      // If accepting, create a trip and update vehicle status
      if (action === 'aceptar') {
        try {
          // Create a minimal trip
          const trip = await TripRepository.create({
            vehicle_id: offer.vehicle_id,
            despachador_id: offer.despachador_id,
            origen: 'Origen asignado',
            destino: 'Destino asignado',
            carga: offer.mensaje || '',
            distancia_km: null,
            tiempo_estimado_horas: null,
          });

          createdTripId = trip.id;

          // Update offer with trip ID
          await OfferRepository.updateStatus(offerId, 'aceptado', trip.id);

          // Update vehicle status to "Contratado"
          // Also remove the original offer notification(s) for the conductor so it disappears
          // from their notifications list once accepted.
          try {
            // vehicles DB enum doesn't have 'Contratado', use 'En viaje' instead
            await VehicleRepository.updateStatus(offer.vehicle_id, 'En viaje');

            // Remove notifications related to this offer for the accepting user (conductor)
            const offerNotifications = await NotificationRepository.findByOffer(offerId);
            for (const n of offerNotifications) {
              if (n.user_id === user.id) {
                await NotificationRepository.delete(n.id, user.id);
              }
            }
          } catch (err) {
            // Don't block the accept flow if notification deletion or status update fails
            console.error('Error updating vehicle status or cleaning notifications:', err);
          }

        } catch (tripError) {
          console.error('Error creating trip when accepting offer:', tripError);
        }
      } else {
        // Reject offer
        await OfferRepository.updateStatus(offerId, 'rechazado');
      }

      // Create notification for dispatcher
      const title = action === 'aceptar' ? 'Oferta aceptada' : 'Oferta rechazada';
      const message = action === 'aceptar' 
        ? `La oferta #${offerId} fue aceptada por el conductor`
        : `La oferta #${offerId} fue rechazada por el conductor`;

      await NotificationRepository.create({
        user_id: offer.despachador_id,
        titulo: title,
        mensaje: message,
        tipo: 'info',
        offer_id: offerId,
      });

      // Mark the original offer notification as read
      // Note: This would require adding offer_id to the notification query
      // For now, we'll skip this step

      return {
        success: true,
        message: 'Respuesta enviada',
        tripId: createdTripId,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get pending offers for conductor
  async getPendingOffers(conductorId) {
    try {
      const offers = await OfferRepository.findPendingByConductor(conductorId);
      return {
        success: true,
        offers,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener ofertas pendientes',
      };
    }
  }

  // Get offers by dispatcher
  async getOffersByDispatcher(dispatcherId) {
    try {
      const offers = await OfferRepository.findByDispatcher(dispatcherId);
      return {
        success: true,
        offers,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener ofertas del despachador',
      };
    }
  }

  // Get offers by conductor
  async getOffersByConductor(conductorId) {
    try {
      const offers = await OfferRepository.findByConductor(conductorId);
      return {
        success: true,
        offers,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener ofertas del conductor',
      };
    }
  }
}

module.exports = new OfferService();