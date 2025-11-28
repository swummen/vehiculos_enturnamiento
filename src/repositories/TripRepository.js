// Trip Repository - Data Access Layer
const Trip = require('../models/Trip');
const { query, pool } = require('../infrastructure/database');

class TripRepository {
  // Create a new trip
  async create(tripData) {
    const { vehicle_id, despachador_id, origen, destino, carga, distancia_km, tiempo_estimado_horas } = tripData;
    
    const [result] = await pool.execute(
      `INSERT INTO trips 
        (vehicle_id, despachador_id, origen, destino, carga, distancia_km, tiempo_estimado_horas) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [vehicle_id, despachador_id, origen, destino, carga, distancia_km, tiempo_estimado_horas]
    );

    return new Trip({ id: result.insertId, ...tripData, estado: 'En curso' });
  }

  // Find trip by ID
  async findById(id) {
    const trips = await query(
      `SELECT t.*, v.placa, v.tipo_vehiculo, v.conductor_id AS conductor_id,
              u1.nombre AS conductor_nombre,
              u2.nombre AS despachador_nombre
       FROM trips t
       JOIN vehicles v ON t.vehicle_id = v.id
       JOIN users u1 ON v.conductor_id = u1.id
       JOIN users u2 ON t.despachador_id = u2.id
       WHERE t.id = ?`,
      [id]
    );

    return trips.length > 0 ? new Trip(trips[0]) : null;
  }

  // Get all trips with filters
  async findAll(filters = {}) {
    const { estado, despachador_id, vehicle_id } = filters;
    
        let sql = `
          SELECT t.*, v.placa, v.tipo_vehiculo, v.conductor_id AS conductor_id,
            u1.nombre AS conductor_nombre,
            u2.nombre AS despachador_nombre
          FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN users u1 ON v.conductor_id = u1.id
      JOIN users u2 ON t.despachador_id = u2.id
      WHERE 1=1
    `;
    const params = [];

     if (estado) {
      sql += ' AND t.estado = ?';
      params.push(estado);
    }
    if (despachador_id) {
      sql += ' AND t.despachador_id = ?';
      params.push(despachador_id);
    }
    if (vehicle_id) {
      // support passing an array of vehicle IDs (for conductors with multiple vehicles)
      if (Array.isArray(vehicle_id) && vehicle_id.length > 0) {
        const placeholders = vehicle_id.map(() => '?').join(',');
        sql += ` AND t.vehicle_id IN (${placeholders})`;
        params.push(...vehicle_id);
      } else {
        sql += ' AND t.vehicle_id = ?';
        params.push(vehicle_id);
      }
    }

      sql += ' ORDER BY t.fecha_inicio DESC';

    const trips = await query(sql, params);
    return trips.map(tripData => new Trip(tripData));
  }

  // Update trip status
  async updateStatus(id, status) {
    const updateFields = ['estado = ?'];
    const params = [status];

    if (status === 'Finalizado') {
      updateFields.push('fecha_fin = CURRENT_TIMESTAMP');
    }

    await query(
      `UPDATE trips SET ${updateFields.join(', ')} WHERE id = ?`,
      [...params, id]
    );
    
    return this.findById(id);
  }

  // Get trips by dispatcher
  async findByDispatcher(dispatcherId) {
    const trips = await query(
      'SELECT * FROM trips WHERE despachador_id = ? ORDER BY fecha_inicio DESC',
      [dispatcherId]
    );
    return trips.map(tripData => new Trip(tripData));
  }

  // Get trips by vehicle
  async findByVehicle(vehicleId) {
    const trips = await query(
      'SELECT * FROM trips WHERE vehicle_id = ? ORDER BY fecha_inicio DESC',
      [vehicleId]
    );
    return trips.map(tripData => new Trip(tripData));
  }

  // Finalize trip
  async finalize(id) {
    await query(
      `UPDATE trips 
       SET estado = "Finalizado", fecha_fin = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [id]
    );
    
    return this.findById(id);
  }
}

module.exports = new TripRepository();