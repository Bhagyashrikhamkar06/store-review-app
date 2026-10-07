const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { verifyToken, requireNormalUser } = require('../middleware/auth');
const { validateRatingField } = require('../middleware/validate');

// Normal users or any authenticated user can view stores and their own rating
router.get('/', verifyToken, storeController.getStoresForUser);

// Rating actions are specifically for NORMAL_USER
router.post('/:storeId/rating', requireNormalUser, validateRatingField, storeController.submitRating);
router.put('/:storeId/rating', requireNormalUser, validateRatingField, storeController.modifyRating);

module.exports = router;
