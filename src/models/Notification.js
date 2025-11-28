// Notification Entity Model
class Notification {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.titulo = data.titulo;
    this.mensaje = data.mensaje;
    this.tipo = data.tipo;
    this.leida = data.leida;
    this.accion = data.accion;
    this.fecha_creacion = data.fecha_creacion;
    this.offer_id = data.offer_id;
  }

  // Validation methods
  isValidType() {
    return ['info', 'warning', 'error'].includes(this.tipo);
  }

  isRead() {
    return this.leida === true || this.leida === 1;
  }

  isUnread() {
    return !this.isRead();
  }

  // Status management
  markAsRead() {
    this.leida = true;
  }

  markAsUnread() {
    this.leida = false;
  }

  // Check if notification belongs to user
  belongsToUser(userId) {
    return this.user_id === userId;
  }

  // Check if notification is related to an offer
  isOfferRelated() {
    return this.offer_id !== null && this.offer_id !== undefined;
  }
}

module.exports = Notification;