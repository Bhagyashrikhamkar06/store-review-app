const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { requireStoreOwner } = require('../middleware/auth');

// Owner routes require STORE_OWNER role
router.use(requireStoreOwner);

router.get('/dashboard', ownerController.getOwnerDashboard);

module.exports = router;
