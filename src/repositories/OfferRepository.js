// Offer Repository - Data Access Layer
const Offer = require('../models/Offer');
const { query, pool } = require('../infrastructure/database');

class OfferRepository {
  // Create a new offer
  async create(offerData) {
    const { despachador_id, conductor_id, vehicle_id, mensaje } = offerData;
    
    const [result] = await pool.execute(
      'INSERT INTO offers (despachador_id, conductor_id, vehicle_id, mensaje) VALUES (?, ?, ?, ?)',
      [despachador_id, conductor_id, vehicle_id, mensaje || '']
    );

    return new Offer({ id: result.insertId, ...offerData, estado: 'enviado' });
  }

  // Find offer by ID
  async findById(id) {
    const offers = await query('SELECT * FROM offers WHERE id = ?', [id]);
    return offers.length > 0 ? new Offer(offers[0]) : null;
  }

  // Get all offers with filters
  async findAll(filters = {}) {
    const { despachador_id, conductor_id, estado } = filters;
    
    let sql = 'SELECT * FROM offers WHERE 1=1';
    const params = [];

    if (despachador_id) {
      sql += ' AND despachador_id = ?';
      params.push(despachador_id);
    }
    if (conductor_id) {
      sql += ' AND conductor_id = ?';
      params.push(conductor_id);
    }
    if (estado) {
      sql += ' AND estado = ?';
      params.push(estado);
    }

    sql += ' ORDER BY fecha_creacion DESC';

    const offers = await query(sql, params);
    return offers.map(offerData => new Offer(offerData));
  }

  // Update offer status
  async updateStatus(id, status, tripId = null) {
    const params = [status, id];
    let sql = 'UPDATE offers SET estado = ? WHERE id = ?';

    if (tripId) {
      // Try updating with trip_id; if the column doesn't exist, fall back to updating without it
      try {
        const sqlWithTrip = 'UPDATE offers SET estado = ?, trip_id = ? WHERE id = ?';
        await query(sqlWithTrip, [status, tripId, id]);
        return this.findById(id);
      } catch (err) {
        // ER_BAD_FIELD_ERROR means column likely missing; fallback
        if (err && err.code === 'ER_BAD_FIELD_ERROR') {
          // update estado only
          await query('UPDATE offers SET estado = ? WHERE id = ?', [status, id]);
          return this.findById(id);
        }
        throw err;
      }
    }

    await query(sql, params);
    return this.findById(id);
  }

  // Get offers by dispatcher
  async findByDispatcher(dispatcherId) {
    const offers = await query(
      'SELECT * FROM offers WHERE despachador_id = ? ORDER BY fecha_creacion DESC',
      [dispatcherId]
    );
    return offers.map(offerData => new Offer(offerData));
  }

  // Get offers by conductor
  async findByConductor(conductorId) {
    const offers = await query(
      'SELECT * FROM offers WHERE conductor_id = ? ORDER BY fecha_creacion DESC',
      [conductorId]
    );
    return offers.map(offerData => new Offer(offerData));
  }

  // Get pending offers for conductor
  async findPendingByConductor(conductorId) {
    const offers = await query(
      'SELECT * FROM offers WHERE conductor_id = ? AND estado = "enviado" ORDER BY fecha_creacion DESC',
      [conductorId]
    );
    return offers.map(offerData => new Offer(offerData));
  }

  // Accept offer and create trip
  async acceptOffer(id, tripData = null) {
    let createdTripId = null;
    
    if (tripData) {
      const tripRepository = require('./TripRepository');
      const trip = await tripRepository.create(tripData);
      createdTripId = trip.id;
    }

    try {
      await query('UPDATE offers SET estado = "aceptado", trip_id = ? WHERE id = ?', [createdTripId, id]);
    } catch (err) {
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        // Column trip_id missing — fallback: update only estado
        await query('UPDATE offers SET estado = "aceptado" WHERE id = ?', [id]);
      } else {
        throw err;
      }
    }

    return this.findById(id);
  }

  // Reject offer
  async rejectOffer(id) {
    await query('UPDATE offers SET estado = "rechazado" WHERE id = ?', [id]);
    return this.findById(id);
  }

  // Get hiring history with details for dispatcher
  async findByDispatcherWithDetails(dispatcherId, filters = {}) {
    const { estado, fecha_desde, fecha_hasta } = filters;
    
    let sql = `
      SELECT o.*, 
             v.placa, v.tipo_vehiculo, v.tipo_carroceria,
             u.nombre as conductor_nombre, u.telefono as conductor_telefono
      FROM offers o
      JOIN vehicles v ON o.vehicle_id = v.id
      JOIN users u ON o.conductor_id = u.id
      WHERE o.despachador_id = ?
    `;
    const params = [dispatcherId];

    if (estado) {
      sql += ' AND o.estado = ?';
      params.push(estado);
    }
    if (fecha_desde) {
      sql += ' AND DATE(o.fecha_creacion) >= ?';
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      sql += ' AND DATE(o.fecha_creacion) <= ?';
      params.push(fecha_hasta);
    }

    sql += ' ORDER BY o.fecha_creacion DESC';

    const offers = await query(sql, params);
    return offers.map(offerData => new Offer(offerData));
  }
}

module.exports = new OfferRepository();