// Vehicle Entity Model
class Vehicle {
  constructor(data = {}) {
    this.id = data.id;
    this.placa = data.placa;
    this.tipo_vehiculo = data.tipo_vehiculo;
    this.tipo_carroceria = data.tipo_carroceria;
    this.ciudad_origen = data.ciudad_origen;
    this.destino_preferente = data.destino_preferente;
    this.estado = data.estado;
    this.conductor_id = data.conductor_id;
    this.ubicacion_gps = data.ubicacion_gps;
    this.fecha_actualizacion = data.fecha_actualizacion;
    this.conductor_nombre = data.conductor_nombre;
    this.conductor_telefono = data.conductor_telefono;
  }

  // Validation methods
  isValidState() {
    return ['Disponible', 'En viaje', 'Mantenimiento'].includes(this.estado);
  }

  isAvailable() {
    return this.estado === 'Disponible';
  }

  // Status management
  setStatus(newStatus) {
    if (!this.isValidState()) {
      throw new Error(`Invalid vehicle state: ${newStatus}`);
    }
    this.estado = newStatus;
    this.fecha_actualizacion = new Date();
  }

  // Location management
  updateLocation(lat, lng) {
    this.ubicacion_gps = `${lat},${lng}`;
    this.fecha_actualizacion = new Date();
  }

  // Check if vehicle belongs to conductor
  belongsToConductor(conductorId) {
    return this.conductor_id === conductorId;
  }
}

module.exports = Vehicle;