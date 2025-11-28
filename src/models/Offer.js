// Offer Entity Model
class Offer {
  constructor(data = {}) {
    this.id = data.id;
    this.despachador_id = data.despachador_id;
    this.conductor_id = data.conductor_id;
    this.vehicle_id = data.vehicle_id;
    this.estado = data.estado;
    this.mensaje = data.mensaje;
    this.fecha_creacion = data.fecha_creacion;
    this.trip_id = data.trip_id;
  }

  // Validation methods
  isValidState() {
    return ['enviado', 'aceptado', 'rechazado'].includes(this.estado);
  }

  isPending() {
    return this.estado === 'enviado';
  }

  isAccepted() {
    return this.estado === 'aceptado';
  }

  isRejected() {
    return this.estado === 'rechazado';
  }

  // Status management
  setStatus(newStatus) {
    if (!this.isValidState()) {
      throw new Error(`Invalid offer state: ${newStatus}`);
    }
    this.estado = newStatus;
  }

  // Response management
  accept() {
    this.estado = 'aceptado';
  }

  reject() {
    this.estado = 'rechazado';
  }

  // Check if offer belongs to dispatcher
  belongsToDispatcher(dispatcherId) {
    return this.despachador_id === dispatcherId;
  }

  // Check if offer belongs to conductor
  belongsToConductor(conductorId) {
    return this.conductor_id === conductorId;
  }

  // Check if offer can be responded by conductor
  canBeRespondedBy(conductorId) {
    return this.belongsToConductor(conductorId) && this.isPending();
  }
}

module.exports = Offer;