// User Entity Model
class User {
  constructor(data = {}) {
    this.id = data.id;
    this.username = data.username;
    this.password = data.password;
    this.role = data.role;
    this.nombre = data.nombre;
    this.email = data.email;
    this.telefono = data.telefono;
    this.estado = data.estado;
    this.fecha_registro = data.fecha_registro;
  }

  // Validation methods
  isValidRole() {
    return ['conductor', 'despachador', 'administrador'].includes(this.role);
  }

  isValidState() {
    return ['activo', 'inactivo'].includes(this.estado);
  }

  // Data transformation
  toSafeObject() {
    const { password, ...safeUser } = this;
    return safeUser;
  }

  // Check if user has permission for a specific role
  hasRole(role) {
    return this.role === role;
  }

  // Check if user can access resource based on role
  canAccessResource(resource) {
    const permissions = {
      'admin': ['all'],
      'despachador': ['trips', 'offers', 'vehicles', 'chats'],
      'conductor': ['vehicles', 'trips', 'offers', 'chats']
    };

    return permissions[this.role]?.includes(resource) || permissions[this.role]?.includes('all');
  }
}

module.exports = User;