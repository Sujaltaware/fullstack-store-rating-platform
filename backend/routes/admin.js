const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const {
  nameValidation,
  emailValidation,
  addressValidation,
  passwordValidation,
  roleValidation,
} = require('../utils/validation');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

const buildFilterQuery = (baseQuery, filters, allowedFields) => {
  const conditions = [];
  const params = [];

  allowedFields.forEach((field) => {
    if (filters[field]) {
      conditions.push(`${field} LIKE ?`);
      params.push(`%${filters[field]}%`);
    }
  });

  if (conditions.length > 0) {
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }

  return { query: baseQuery, params };
};

const buildSortQuery = (sortBy, sortOrder, allowedSorts, defaultSort = 'name') => {
  const field = allowedSorts.includes(sortBy) ? sortBy : defaultSort;
  const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
  return ` ORDER BY ${field} ${order}`;
};

// GET /api/admin/dashboard - Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [storeCount] = await pool.query('SELECT COUNT(*) as total FROM stores');
    const [ratingCount] = await pool.query('SELECT COUNT(*) as total FROM ratings');

    const [roleCounts] = await pool.query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    const usersByRole = { admin: 0, user: 0, store_owner: 0 };
    roleCounts.forEach((r) => {
      usersByRole[r.role] = r.count;
    });

    const [avgRating] = await pool.query(
      'SELECT COALESCE(AVG(rating), 0) as average FROM ratings'
    );

    const [recentUsers] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    const [recentStores] = await pool.query(
      `SELECT s.id, s.name, s.address,
        COALESCE(AVG(r.rating), 0) as rating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       GROUP BY s.id
       ORDER BY s.created_at DESC LIMIT 5`
    );

    res.json({
      totalUsers: userCount[0].total,
      totalStores: storeCount[0].total,
      totalRatings: ratingCount[0].total,
      usersByRole,
      averageRating: parseFloat(avgRating[0].average).toFixed(1),
      recentUsers,
      recentStores: recentStores.map((s) => ({
        ...s,
        rating: parseFloat(s.rating).toFixed(1),
      })),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users - List users with filters and sorting
router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role, sortBy, sortOrder } = req.query;

    let query = 'SELECT id, name, email, address, role, created_at FROM users';
    const { query: filteredQuery, params } = buildFilterQuery(query, { name, email, address, role }, [
      'name',
      'email',
      'address',
      'role',
    ]);

    const allowedSorts = ['name', 'email', 'address', 'role', 'created_at'];
    const finalQuery = filteredQuery + buildSortQuery(sortBy, sortOrder, allowedSorts);

    const [users] = await pool.query(finalQuery, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users/:id - User details
router.get('/users/:id', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    let rating = null;

    if (user.role === 'store_owner') {
      const [storeData] = await pool.query(
        `SELECT COALESCE(AVG(r.rating), 0) as average_rating
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = ?`,
        [user.id]
      );
      rating = parseFloat(storeData[0].average_rating).toFixed(1);
    }

    res.json({ ...user, rating });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/users - Add new user (admin, user, or store_owner)
router.post(
  '/users',
  [nameValidation, emailValidation, addressValidation, passwordValidation, roleValidation],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, password, role = 'user' } = req.body;

    try {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email is already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, address, role]
      );

      res.status(201).json({
        message: 'User created successfully',
        user: { id: result.insertId, name, email, address, role },
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/admin/stores - List stores with filters and sorting
router.get('/stores', async (req, res) => {
  try {
    const { name, email, address, sortBy, sortOrder } = req.query;

    let query = `
      SELECT s.id, s.name, s.email, s.address,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as total_ratings,
        u.name as owner_name
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id`;

    const conditions = [];
    const params = [];

    if (name) {
      conditions.push('s.name LIKE ?');
      params.push(`%${name}%`);
    }
    if (email) {
      conditions.push('s.email LIKE ?');
      params.push(`%${email}%`);
    }
    if (address) {
      conditions.push('s.address LIKE ?');
      params.push(`%${address}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY s.id';

    const sortMap = { name: 's.name', email: 's.email', address: 's.address', rating: 'rating', 's.name': 's.name' };
    const sortField = sortMap[sortBy] || 's.name';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${order}`;

    const [stores] = await pool.query(query, params);

    const formattedStores = stores.map((store) => ({
      ...store,
      rating: parseFloat(store.rating).toFixed(1),
    }));

    res.json(formattedStores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/stores - Add new store
router.post(
  '/stores',
  [
    body('name').trim().notEmpty().withMessage('Store name is required'),
    emailValidation,
    addressValidation,
    body('ownerId').isInt().withMessage('Store owner is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, ownerId } = req.body;

    try {
      const [owners] = await pool.query(
        'SELECT id FROM users WHERE id = ? AND role = ?',
        [ownerId, 'store_owner']
      );

      if (owners.length === 0) {
        return res.status(400).json({ message: 'Invalid store owner. User must have store_owner role.' });
      }

      const [result] = await pool.query(
        'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
        [name, email, address, ownerId]
      );

      res.status(201).json({
        message: 'Store created successfully',
        store: { id: result.insertId, name, email, address, ownerId },
      });
    } catch (error) {
      console.error('Create store error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/admin/store-owners - Get list of store owners for dropdown
router.get('/store-owners', async (req, res) => {
  try {
    const [owners] = await pool.query(
      'SELECT id, name, email FROM users WHERE role = ? ORDER BY name',
      ['store_owner']
    );
    res.json(owners);
  } catch (error) {
    console.error('Get store owners error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
