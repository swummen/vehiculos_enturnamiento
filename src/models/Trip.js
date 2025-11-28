// Trip Entity Model
class Trip {
  constructor(data = {}) {
    this.id = data.id;
    this.vehicle_id = data.vehicle_id;
    this.despachador_id = data.despachador_id;
    this.origen = data.origen;
    this.destino = data.destino;
    this.carga = data.carga;
    this.estado = data.estado;
    this.fecha_inicio = data.fecha_inicio;
    this.fecha_fin = data.fecha_fin;
    this.distancia_km = data.distancia_km;
    this.tiempo_estimado_horas = data.tiempo_estimado_horas;
    this.placa = data.placa;
    this.tipo_vehiculo = data.tipo_vehiculo;
    this.conductor_id = data.conductor_id;
    this.conductor_nombre = data.conductor_nombre;
    this.despachador_nombre = data.despachador_nombre;
  }

  // Validation methods
  isValidState() {
    return ['En curso', 'Finalizado', 'Completado'].includes(this.estado);
  }

  isActive() {
    return this.estado === 'En curso';
  }

  isCompleted() {
    return ['Finalizado', 'Completado'].includes(this.estado);
  }

  // Status management
  setStatus(newStatus) {
    if (!this.isValidState()) {
      throw new Error(`Invalid trip state: ${newStatus}`);
    }
    this.estado = newStatus;
  }

  // Complete the trip
  complete() {
    this.estado = 'Finalizado';
    this.fecha_fin = new Date();
  }

  // Check if trip belongs to dispatcher
  belongsToDispatcher(dispatcherId) {
    return String(this.despachador_id) === String(dispatcherId);
  }

  // Check if trip belongs to vehicle/conductor
  belongsToVehicle(vehicleId) {
    return this.vehicle_id === vehicleId;
  }

  // Check if trip belongs to conductor
  belongsToConductor(conductorId) {
    return this.conductor_id === conductorId || String(this.conductor_id) === String(conductorId);
  }
}

module.exports = Trip;