// Message Repository - Data Access Layer
const Message = require('../models/Message');
const { query, pool } = require('../infrastructure/database');

class MessageRepository {
  // Create a new message
  async create(messageData) {
    const { from_user, to_user, message, offer_id } = messageData;
    
    const [result] = await pool.execute(
      'INSERT INTO messages (from_user, to_user, message, offer_id) VALUES (?, ?, ?, ?)',
      [from_user, to_user, message, offer_id || null]
    );

    return new Message({ id: result.insertId, ...messageData });
  }

  // Find message by ID
  async findById(id) {
    const messages = await query(
      'SELECT * FROM messages WHERE id = ?',
      [id]
    );

    return messages.length > 0 ? new Message(messages[0]) : null;
  }

  // Get messages between two users
  async getConversation(user1, user2) {
    const messages = await query(
      `SELECT m.*, uf.nombre AS from_name, ut.nombre AS to_name
       FROM messages m
       JOIN users uf ON uf.id = m.from_user
       JOIN users ut ON ut.id = m.to_user
       WHERE (m.from_user = ? AND m.to_user = ?) OR (m.from_user = ? AND m.to_user = ?)
       ORDER BY m.created_at ASC`,
      [user1, user2, user2, user1]
    );
    return messages.map(messageData => new Message(messageData));
  }

  // Get recent conversations for a user
  async getConversations(userId) {
    const rows = await query(
      `SELECT m.id, m.from_user, m.to_user, m.message, m.offer_id, m.created_at,
              CASE WHEN m.from_user = ? THEN m.to_user ELSE m.from_user END AS other_user_id
       FROM messages m
       WHERE m.from_user = ? OR m.to_user = ?
       ORDER BY m.created_at DESC`,
      [userId, userId, userId]
    );

    const convMap = new Map();
    for (const r of rows) {
      const otherId = r.other_user_id;
      if (!convMap.has(otherId)) {
        // fetch basic other user data
        const urows = await query('SELECT id, username, nombre FROM users WHERE id = ?', [otherId]);
        const other = (urows && urows[0]) || { id: otherId, username: 'Usuario', nombre: '' };
        convMap.set(otherId, {
          other_user_id: otherId,
          username: other.username,
          nombre: other.nombre,
          last_message: r.message,
          last_at: r.created_at,
        });
      }
    }

    return Array.from(convMap.values());
  }

  // Get messages related to an offer
  async getOfferMessages(offerId) {
    const messages = await query(
      'SELECT * FROM messages WHERE offer_id = ? ORDER BY created_at ASC',
      [offerId]
    );
    return messages.map(messageData => new Message(messageData));
  }

  // Get all messages for a user (sent or received)
  async getUserMessages(userId) {
    const messages = await query(
      'SELECT * FROM messages WHERE from_user = ? OR to_user = ? ORDER BY created_at DESC',
      [userId, userId]
    );
    return messages.map(messageData => new Message(messageData));
  }

  // Get messages by offer and user
  async getOfferUserMessages(offerId, userId) {
    const messages = await query(
      `SELECT * FROM messages 
       WHERE offer_id = ? AND (from_user = ? OR to_user = ?)
       ORDER BY created_at ASC`,
      [offerId, userId, userId]
    );
    return messages.map(messageData => new Message(messageData));
  }
}

module.exports = new MessageRepository();