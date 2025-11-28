// Vehicle Repository - Data Access Layer
const Vehicle = require('../models/Vehicle');
const { query, pool } = require('../infrastructure/database');

class VehicleRepository {
  // Create a new vehicle
  async create(vehicleData) {
    const { placa, tipo_vehiculo, tipo_carroceria, ciudad_origen, destino_preferente, conductor_id } = vehicleData;
    
    const [result] = await pool.execute(
      `INSERT INTO vehicles 
        (placa, tipo_vehiculo, tipo_carroceria, ciudad_origen, destino_preferente, conductor_id, estado) 
       VALUES (?, ?, ?, ?, ?, ?, 'Disponible')`,
      [placa, tipo_vehiculo, tipo_carroceria, ciudad_origen, destino_preferente, conductor_id]
    );

    return new Vehicle({ id: result.insertId, ...vehicleData, estado: 'Disponible' });
  }

  // Find vehicle by ID
  async findById(id) {
    const vehicles = await query(
      'SELECT * FROM vehicles WHERE id = ?',
      [id]
    );

    return vehicles.length > 0 ? new Vehicle(vehicles[0]) : null;
  }

  // Get all vehicles with filters
  async findAll(filters = {}) {
    const { estado, ciudad, tipo_vehiculo, tipo_carroceria, conductor_id } = filters;
    
    let sql = `
      SELECT v.*, u.nombre AS conductor_nombre, u.telefono AS conductor_telefono
      FROM vehicles v
      JOIN users u ON v.conductor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (estado) {
      sql += ' AND v.estado = ?';
      params.push(estado);
    }
    if (ciudad) {
      sql += ' AND v.ciudad_origen = ?';
      params.push(ciudad);
    }
    if (tipo_vehiculo) {
      sql += ' AND v.tipo_vehiculo = ?';
      params.push(tipo_vehiculo);
    }
    if (tipo_carroceria) {
      sql += ' AND v.tipo_carroceria = ?';
      params.push(tipo_carroceria);
    }
    if (conductor_id) {
      sql += ' AND v.conductor_id = ?';
      params.push(conductor_id);
    }

    sql += ' ORDER BY v.fecha_actualizacion DESC';

    const vehicles = await query(sql, params);
    return vehicles.map(vehicleData => new Vehicle(vehicleData));
  }

  // Update vehicle status
  async updateStatus(id, status) {
    await query(
      'UPDATE vehicles SET estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  }

  // Update vehicle location
  async updateLocation(id, lat, lng) {
    const ubicacion = `${lat},${lng}`;
    await query(
      `UPDATE vehicles 
       SET ubicacion_gps = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [ubicacion, id]
    );
    return this.findById(id);
  }

  // Check if plate exists
  async plateExists(placa, excludeId = null) {
    let sql = 'SELECT id FROM vehicles WHERE placa = ?';
    const params = [placa];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const vehicles = await query(sql, params);
    return vehicles.length > 0;
  }

  // Get available vehicles
  async findAvailable() {
    const vehicles = await query(
      'SELECT * FROM vehicles WHERE estado = "Disponible" ORDER BY fecha_actualizacion DESC'
    );
    return vehicles.map(vehicleData => new Vehicle(vehicleData));
  }

  // Get vehicles by conductor
  async findByConductor(conductorId) {
    const vehicles = await query(
      'SELECT * FROM vehicles WHERE conductor_id = ? ORDER BY fecha_actualizacion DESC',
      [conductorId]
    );
    return vehicles.map(vehicleData => new Vehicle(vehicleData));
  }

  // Get vehicles with location data (for map view)
  async findAllWithLocation(filters = {}) {
    const { ciudad_origen, tipo_vehiculo, tipo_carroceria, estado } = filters;
    
    let sql = `
      SELECT v.*, u.nombre AS conductor_nombre, u.telefono AS conductor_telefono
      FROM vehicles v
      JOIN users u ON v.conductor_id = u.id
      WHERE v.ubicacion_gps IS NOT NULL AND v.ubicacion_gps != ''
    `;
    const params = [];

    if (ciudad_origen) {
      sql += ' AND v.ciudad_origen = ?';
      params.push(ciudad_origen);
    }
    if (tipo_vehiculo) {
      sql += ' AND v.tipo_vehiculo = ?';
      params.push(tipo_vehiculo);
    }
    if (tipo_carroceria) {
      sql += ' AND v.tipo_carroceria = ?';
      params.push(tipo_carroceria);
    }
    if (estado) {
      sql += ' AND v.estado = ?';
      params.push(estado);
    }

    sql += ' ORDER BY v.fecha_actualizacion DESC';

    const vehicles = await query(sql, params);
    return vehicles.map(vehicleData => new Vehicle(vehicleData));
  }

  // Get available vehicles with driver details
  async findAvailableWithDrivers(city = null, vehicleType = null) {
    let sql = `
      SELECT v.*, u.nombre AS conductor_nombre, u.telefono AS conductor_telefono
      FROM vehicles v
      JOIN users u ON v.conductor_id = u.id
      WHERE v.estado = 'Disponible'
    `;
    const params = [];

    if (city) {
      sql += ' AND v.ciudad_origen = ?';
      params.push(city);
    }
    if (vehicleType) {
      sql += ' AND v.tipo_vehiculo = ?';
      params.push(vehicleType);
    }

    sql += ' ORDER BY v.fecha_actualizacion DESC';

    const vehicles = await query(sql, params);
    return vehicles.map(vehicleData => new Vehicle(vehicleData));
  }
}

module.exports = new VehicleRepository();