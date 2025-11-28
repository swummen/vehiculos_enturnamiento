// City Entity Model
class City {
  constructor(data = {}) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.departamento = data.departamento;
    this.codigo = data.codigo;
    this.estado = data.estado;
  }

  // Validation methods
  isValidState() {
    return ['activa', 'inactiva'].includes(this.estado);
  }

  isActive() {
    return this.estado === 'activa';
  }

  // Status management
  activate() {
    this.estado = 'activa';
  }

  deactivate() {
    this.estado = 'inactiva';
  }

  // Get full name
  getFullName() {
    return `${this.nombre}, ${this.departamento}`;
  }
}

module.exports = City;