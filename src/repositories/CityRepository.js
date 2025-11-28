// City Repository - Data Access Layer
const City = require('../models/City');
const { query, pool } = require('../infrastructure/database');

class CityRepository {
  // Create a new city
  async create(cityData) {
    const { nombre, departamento, codigo } = cityData;
    
    const [result] = await pool.execute(
      'INSERT INTO cities (nombre, departamento, codigo) VALUES (?, ?, ?)',
      [nombre, departamento, codigo]
    );

    return new City({ id: result.insertId, ...cityData, estado: 'activa' });
  }

  // Find city by ID
  async findById(id) {
    const cities = await query('SELECT * FROM cities WHERE id = ?', [id]);
    return cities.length > 0 ? new City(cities[0]) : null;
  }

  // Find city by code
  async findByCode(codigo) {
    const cities = await query('SELECT * FROM cities WHERE codigo = ?', [codigo]);
    return cities.length > 0 ? new City(cities[0]) : null;
  }

  // Get all cities
  async findAll() {
    const cities = await query('SELECT * FROM cities ORDER BY nombre ASC');
    return cities.map(cityData => new City(cityData));
  }

  // Get active cities
  async findActive() {
    const cities = await query(
      'SELECT * FROM cities WHERE estado = "activa" ORDER BY nombre ASC'
    );
    return cities.map(cityData => new City(cityData));
  }

  // Update city status
  async updateStatus(id, estado) {
    await query('UPDATE cities SET estado = ? WHERE id = ?', [estado, id]);
    return this.findById(id);
  }

  // Search cities by name
  async searchByName(name) {
    const q = `%${name}%`;
    const cities = await query(
      'SELECT * FROM cities WHERE nombre LIKE ? ORDER BY nombre ASC',
      [q]
    );
    return cities.map(cityData => new City(cityData));
  }

  // Check if code exists
  async codeExists(codigo, excludeId = null) {
    let sql = 'SELECT id FROM cities WHERE codigo = ?';
    const params = [codigo];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const cities = await query(sql, params);
    return cities.length > 0;
  }

  // Get cities by department
  async findByDepartment(departamento) {
    const cities = await query(
      'SELECT * FROM cities WHERE departamento = ? ORDER BY nombre ASC',
      [departamento]
    );
    return cities.map(cityData => new City(cityData));
  }
}

module.exports = new CityRepository();