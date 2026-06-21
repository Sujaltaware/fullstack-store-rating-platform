const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const { ratingValidation } = require('../utils/validation');

const router = express.Router();

router.use(authenticate);
router.use(authorize('user'));

// POST /api/ratings - Submit a new rating
router.post('/', [body('storeId').isInt(), ratingValidation], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { storeId, rating } = req.body;
  const userId = req.user.id;

  try {
    const [stores] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already rated this store. Use update instead.' });
    }

    await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [
      userId,
      storeId,
      rating,
    ]);

    res.status(201).json({ message: 'Rating submitted successfully', rating });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/ratings/:storeId - Update existing rating
router.put('/:storeId', [ratingValidation], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rating } = req.body;
  const userId = req.user.id;
  const storeId = req.params.storeId;

  try {
    const [existing] = await pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'No existing rating found. Submit a new rating first.' });
    }

    await pool.query('UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?', [
      rating,
      userId,
      storeId,
    ]);

    res.json({ message: 'Rating updated successfully', rating });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
