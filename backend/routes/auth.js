const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const {
  nameValidation,
  emailValidation,
  addressValidation,
  passwordValidation,
} = require('../utils/validation');

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// POST /api/auth/register - Normal user signup
router.post(
  '/register',
  [nameValidation, emailValidation, addressValidation, passwordValidation],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, password } = req.body;

    try {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email is already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, address, 'user']
      );

      const user = { id: result.insertId, email, role: 'user', name };
      const token = generateToken(user);

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: { id: user.id, name, email, address, role: 'user' },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// POST /api/auth/login - Login for all user types
router.post('/login', [emailValidation, body('password').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// PUT /api/auth/change-password - Update password (logged in users)
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    passwordValidation,
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, password } = req.body;

    try {
      const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
      const isMatch = await bcrypt.compare(currentPassword, users[0].password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/auth/me - Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    let storeRating = null;

    if (user.role === 'store_owner') {
      const [storeData] = await pool.query(
        `SELECT s.id, s.name,
          COALESCE(AVG(r.rating), 0) as average_rating,
          COUNT(r.id) as total_ratings
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = ?
         GROUP BY s.id`,
        [user.id]
      );
      if (storeData.length > 0) {
        storeRating = {
          storeId: storeData[0].id,
          storeName: storeData[0].name,
          averageRating: parseFloat(storeData[0].average_rating).toFixed(1),
          totalRatings: storeData[0].total_ratings,
        };
      }
    }

    res.json({ user, storeRating });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/profile - Update profile (name, address)
router.put(
  '/profile',
  authenticate,
  [nameValidation, addressValidation],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address } = req.body;

    try {
      await pool.query('UPDATE users SET name = ?, address = ? WHERE id = ?', [
        name,
        address,
        req.user.id,
      ]);

      const [users] = await pool.query(
        'SELECT id, name, email, address, role FROM users WHERE id = ?',
        [req.user.id]
      );

      const user = users[0];
      const token = generateToken(user);

      res.json({
        message: 'Profile updated successfully',
        token,
        user,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
