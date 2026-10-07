const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validateUserFields, validatePasswordUpdate } = require('../middleware/validate');

// Public endpoints
router.post('/register', validateUserFields, authController.register);
router.post('/login', authController.login);

// Protected endpoints
router.get('/me', verifyToken, authController.getMe);
router.put('/update-password', verifyToken, validatePasswordUpdate, authController.updatePassword);

module.exports = router;
