// User Repository - Data Access Layer
const User = require('../models/User');
const { query, pool } = require('../infrastructure/database');

class UserRepository {
  // Create a new user
  async create(userData) {
    const { username, password, role, nombre, email, telefono } = userData;
    
    const [result] = await pool.execute(
      `INSERT INTO users (username, password, role, nombre, email, telefono) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, password, role, nombre, email, telefono]
    );

    return new User({ id: result.insertId, ...userData });
  }

  // Find user by username
  async findByUsername(username) {
    const users = await query(
      'SELECT * FROM users WHERE username = ? AND estado = "activo"',
      [username]
    );

    return users.length > 0 ? new User(users[0]) : null;
  }

  // Find user by ID
  async findById(id) {
    const users = await query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    return users.length > 0 ? new User(users[0]) : null;
  }

  // Get all users with filters
  async findAll(filters = {}) {
    const { role, estado } = filters;
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    if (estado) {
      sql += ' AND estado = ?';
      params.push(estado);
    }

    sql += ' ORDER BY fecha_registro DESC';

    const users = await query(sql, params);
    return users.map(userData => new User(userData));
  }

  // Search users by username or name
  async search(searchTerm) {
    const q = `%${searchTerm}%`;
    const users = await query(
      'SELECT id, username, nombre, role FROM users WHERE username LIKE ? OR nombre LIKE ? LIMIT 25',
      [q, q]
    );
    return users.map(userData => new User(userData));
  }

  // Update user role
  async updateRole(id, role) {
    await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return this.findById(id);
  }

  // Update user state
  async updateState(id, estado) {
    await query('UPDATE users SET estado = ? WHERE id = ?', [estado, id]);
    return this.findById(id);
  }

  // Get user profile (current user)
  async getProfile(id) {
    const users = await query(
      'SELECT id, username, role, nombre, email, telefono, estado FROM users WHERE id = ?',
      [id]
    );

    return users.length > 0 ? new User(users[0]) : null;
  }

  // Check if username exists
  async usernameExists(username) {
    const users = await query('SELECT id FROM users WHERE username = ?', [username]);
    return users.length > 0;
  }
}

module.exports = new UserRepository();