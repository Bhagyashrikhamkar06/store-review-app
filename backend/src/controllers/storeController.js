const pool = require('../config/db');

// GET /api/stores?search=...&sort=...&order=...
const getStoresForUser = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { search = '', sort = 'name', order = 'asc' } = req.query;

    const allowedSortFields = {
      name: 's.name',
      address: 's.address',
      rating: 'average_rating',
      my_rating: 'my_rating'
    };

    const sortField = allowedSortFields[sort] || 's.name';
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating,
        COUNT(r.id) AS total_ratings,
        MAX(CASE WHEN r.user_id = ? THEN r.rating ELSE NULL END) AS my_rating,
        MAX(CASE WHEN r.user_id = ? THEN r.updated_at ELSE NULL END) AS my_rated_at
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const params = [userId, userId];

    if (search && search.trim().length > 0) {
      query += ` WHERE (s.name LIKE ? OR s.address LIKE ?)`;
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam);
    }

    query += ` GROUP BY s.id ORDER BY ${sortField} ${sortOrder}`;

    const [rows] = await pool.query(query, params);

    return res.json({
      success: true,
      count: rows.length,
      stores: rows
    });
  } catch (error) {
    console.error('getStoresForUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve stores.' });
  }
};

// POST /api/stores/:storeId/rating (Submit a rating 1-5)
const submitRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const [storeRows] = await pool.query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (storeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Check if already rated
    const [existing] = await pool.query(
      'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already rated this store. Please use update/modify to change your rating.',
        existingRating: existing[0].rating
      });
    }

    await pool.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [userId, storeId, rating]
    );

    // Fetch updated store stats
    const [[stats]] = await pool.query(
      'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully!',
      my_rating: rating,
      average_rating: stats.average_rating,
      total_ratings: stats.total_ratings
    });
  } catch (error) {
    console.error('submitRating error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit rating.' });
  }
};

// PUT /api/stores/:storeId/rating (Modify existing rating 1-5)
const modifyRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const [storeRows] = await pool.query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (storeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Check if user has rated
    const [existing] = await pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existing.length === 0) {
      // If no existing rating found, allow upsert
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
    } else {
      await pool.query(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, userId, storeId]
      );
    }

    // Fetch updated store stats
    const [[stats]] = await pool.query(
      'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = ?',
      [storeId]
    );

    return res.json({
      success: true,
      message: 'Rating updated successfully!',
      my_rating: rating,
      average_rating: stats.average_rating,
      total_ratings: stats.total_ratings
    });
  } catch (error) {
    console.error('modifyRating error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update rating.' });
  }
};

module.exports = {
  getStoresForUser,
  submitRating,
  modifyRating
};
