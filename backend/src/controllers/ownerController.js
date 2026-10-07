const pool = require('../config/db');

// GET /api/owner/dashboard
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sort = 'date', order = 'desc' } = req.query;

    // Find store owned by this user
    const [storeRows] = await pool.query(
      `SELECT id, name, email, address, created_at FROM stores WHERE owner_id = ?`,
      [ownerId]
    );

    if (storeRows.length === 0) {
      return res.json({
        success: true,
        hasStore: false,
        message: 'No store currently assigned to your account.',
        store: null,
        averageRating: 0,
        totalRatings: 0,
        ratings: []
      });
    }

    const store = storeRows[0];

    // Fetch average rating and total ratings count
    const [[stats]] = await pool.query(
      `SELECT 
         ROUND(COALESCE(AVG(rating), 0), 1) AS average_rating,
         COUNT(id) AS total_ratings
       FROM ratings WHERE store_id = ?`,
      [store.id]
    );

    // Fetch list of user ratings
    const allowedSortFields = {
      name: 'u.name',
      rating: 'r.rating',
      date: 'r.updated_at'
    };

    const sortField = allowedSortFields[sort] || 'r.updated_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const [ratings] = await pool.query(
      `SELECT 
         r.id,
         r.rating,
         r.created_at,
         r.updated_at,
         u.id AS user_id,
         u.name AS user_name,
         u.email AS user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY ${sortField} ${sortOrder}`,
      [store.id]
    );

    return res.json({
      success: true,
      hasStore: true,
      store,
      averageRating: Number(stats.average_rating) || 0,
      totalRatings: stats.total_ratings || 0,
      ratings
    });
  } catch (error) {
    console.error('getOwnerDashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve store owner dashboard.' });
  }
};

module.exports = {
  getOwnerDashboard
};
