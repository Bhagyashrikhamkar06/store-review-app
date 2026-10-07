const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_store_rating_system_2026');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles.`
      });
    }
    next();
  };
};

const requireAdmin = [verifyToken, requireRole('ADMIN')];
const requireStoreOwner = [verifyToken, requireRole('STORE_OWNER')];
const requireNormalUser = [verifyToken, requireRole('NORMAL_USER')];

module.exports = {
  verifyToken,
  requireRole,
  requireAdmin,
  requireStoreOwner,
  requireNormalUser
};
