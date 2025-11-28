// Notification Repository - Data Access Layer
const Notification = require('../models/Notification');
const { query, pool } = require('../infrastructure/database');

class NotificationRepository {
  // Create a new notification
  async create(notificationData) {
    const { user_id, titulo, mensaje, tipo, offer_id } = notificationData;
    
    const [result] = await pool.execute(
      'INSERT INTO notifications (user_id, titulo, mensaje, tipo, offer_id) VALUES (?, ?, ?, ?, ?)',
      [user_id, titulo, mensaje, tipo || 'info', offer_id || null]
    );

    return new Notification({ id: result.insertId, ...notificationData, leida: false });
  }

  // Find notification by ID
  async findById(id) {
    const notifications = await query(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );

    return notifications.length > 0 ? new Notification(notifications[0]) : null;
  }

  // Get notifications for a user with filters
  async findByUser(userId, filters = {}) {
    const { leida } = filters;
    
    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (leida !== undefined) {
      sql += ' AND leida = ?';
      params.push(leida === 'true');
    }

    sql += ' ORDER BY fecha_creacion DESC';

    const notifications = await query(sql, params);
    return notifications.map(notificationData => new Notification(notificationData));
  }

  // Mark notification as read
  async markAsRead(id, userId) {
    const [result] = await pool.execute(
      'UPDATE notifications SET leida = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    await query(
      'UPDATE notifications SET leida = TRUE WHERE user_id = ? AND leida = FALSE',
      [userId]
    );
  }

  // Get unread count for a user
  async getUnreadCount(userId) {
    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND leida = FALSE',
      [userId]
    );
    return result[0].count;
  }

  // Get notifications by offer
  async findByOffer(offerId) {
    const notifications = await query(
      'SELECT * FROM notifications WHERE offer_id = ? ORDER BY fecha_creacion DESC',
      [offerId]
    );
    return notifications.map(notificationData => new Notification(notificationData));
  }

  // Delete notification
  async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return result.affectedRows > 0;
  }

  // Get recent notifications (for admin logs)
  async getRecent(limit = 50) {
    const notifications = await query(
      'SELECT * FROM notifications ORDER BY fecha_creacion DESC LIMIT ?',
      [limit]
    );
    return notifications.map(notificationData => new Notification(notificationData));
  }
}

module.exports = new NotificationRepository();