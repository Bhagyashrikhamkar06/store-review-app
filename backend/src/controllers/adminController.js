const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalStores }]] = await pool.query('SELECT COUNT(*) AS totalStores FROM stores');
    const [[{ totalRatings }]] = await pool.query('SELECT COUNT(*) AS totalRatings FROM ratings');

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalStores,
        totalRatings
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics.' });
  }
};

// POST /api/admin/stores
const addStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A store with this email already exists.' });
    }

    let validOwnerId = null;
    if (owner_id) {
      const [ownerRows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [owner_id]);
      if (ownerRows.length === 0 || ownerRows[0].role !== 'STORE_OWNER') {
        return res.status(400).json({ success: false, message: 'Selected owner must be a valid user with STORE_OWNER role.' });
      }
      validOwnerId = ownerRows[0].id;
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), address.trim(), validOwnerId]
    );

    return res.status(201).json({
      success: true,
      message: 'Store created successfully!',
      store: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        owner_id: validOwnerId
      }
    });
  } catch (error) {
    console.error('addStore error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create store.' });
  }
};

// POST /api/admin/users
const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = ['ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role) ? role : 'NORMAL_USER';

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), assignedRole]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully!',
      user: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        role: assignedRole
      }
    });
  } catch (error) {
    console.error('addUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
};

// GET /api/admin/stores?sort=name&order=asc&search=...
const getStores = async (req, res) => {
  try {
    const { sort = 'name', order = 'asc', search = '' } = req.query;

    const allowedSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'average_rating',
      created_at: 's.created_at'
    };

    const sortField = allowedSortFields[sort] || 's.name';
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    let query = `
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.owner_id, 
        s.created_at,
        u.name AS owner_name,
        u.email AS owner_email,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const params = [];
    if (search && search.trim().length > 0) {
      query += ` WHERE s.name LIKE ? OR s.address LIKE ? OR s.email LIKE ?`;
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ` GROUP BY s.id, u.id ORDER BY ${sortField} ${sortOrder}`;

    const [rows] = await pool.query(query, params);

    return res.json({
      success: true,
      count: rows.length,
      stores: rows
    });
  } catch (error) {
    console.error('admin getStores error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve stores.' });
  }
};

// GET /api/admin/users?role=...&sort=email&order=desc&search=...
const getUsers = async (req, res) => {
  try {
    const { role, sort = 'name', order = 'asc', search = '' } = req.query;

    const allowedSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      rating: 'store_rating',
      created_at: 'u.created_at'
    };

    const sortField = allowedSortFields[sort] || 'u.name';
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at,
        s.id AS store_id,
        s.name AS store_name,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS store_rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;

    const params = [];

    if (role && ['ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
      query += ` AND u.role = ?`;
      params.push(role);
    }

    if (search && search.trim().length > 0) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)`;
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ` GROUP BY u.id, s.id ORDER BY ${sortField} ${sortOrder}`;

    const [rows] = await pool.query(query, params);

    return res.json({
      success: true,
      count: rows.length,
      users: rows
    });
  } catch (error) {
    console.error('admin getUsers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

// GET /api/admin/store-owners (Helper to populate dropdown when adding/editing store)
const getStoreOwners = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, s.name as current_store_name 
       FROM users u 
       LEFT JOIN stores s ON u.id = s.owner_id 
       WHERE u.role = 'STORE_OWNER' 
       ORDER BY u.name ASC`
    );
    return res.json({ success: true, storeOwners: rows });
  } catch (error) {
    console.error('getStoreOwners error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve store owners.' });
  }
};

module.exports = {
  getDashboardStats,
  addStore,
  addUser,
  getStores,
  getUsers,
  getStoreOwners
};
