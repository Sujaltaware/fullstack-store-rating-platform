const express = require('express');
const { validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const { ratingValidation } = require('../utils/validation');

const router = express.Router();

// GET /api/stores - List all stores (for normal users)
router.get('/', authenticate, authorize('user'), async (req, res) => {
  try {
    const { name, address, sortBy, sortOrder } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT s.id, s.name, s.address,
        COALESCE(AVG(r.rating), 0) as overall_rating,
        COUNT(r.id) as total_ratings,
        ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
    `;

    const conditions = [];
    const params = [userId];

    if (name) {
      conditions.push('s.name LIKE ?');
      params.push(`%${name}%`);
    }
    if (address) {
      conditions.push('s.address LIKE ?');
      params.push(`%${address}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY s.id, ur.rating';

    const allowedSorts = ['s.name', 's.address', 'overall_rating'];
    const sortField = allowedSorts.includes(sortBy) ? sortBy : 's.name';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${order}`;

    const [stores] = await pool.query(query, params);

    const formattedStores = stores.map((store) => ({
      id: store.id,
      name: store.name,
      address: store.address,
      overallRating: parseFloat(store.overall_rating).toFixed(1),
      totalRatings: store.total_ratings,
      userRating: store.user_rating || null,
    }));

    res.json(formattedStores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/stores/owner/dashboard - Store owner dashboard
router.get('/owner/dashboard', authenticate, authorize('store_owner'), async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [stores] = await pool.query('SELECT id, name FROM stores WHERE owner_id = ?', [ownerId]);

    if (stores.length === 0) {
      return res.json({
        store: null,
        averageRating: 0,
        totalRatings: 0,
        raters: [],
        message: 'No store assigned to your account yet.',
      });
    }

    const store = stores[0];

    const [ratingStats] = await pool.query(
      `SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as total_ratings
       FROM ratings WHERE store_id = ?`,
      [store.id]
    );

    const [raters] = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, r.rating, r.updated_at
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    res.json({
      store: { id: store.id, name: store.name },
      averageRating: parseFloat(ratingStats[0].average_rating).toFixed(1),
      totalRatings: ratingStats[0].total_ratings,
      raters,
    });
  } catch (error) {
    console.error('Owner dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
