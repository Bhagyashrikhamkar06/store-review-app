const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const { validateStoreFields, validateUserFields } = require('../middleware/validate');

// All admin routes require ADMIN role
router.use(requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.post('/stores', validateStoreFields, adminController.addStore);
router.post('/users', validateUserFields, adminController.addUser);
router.get('/stores', adminController.getStores);
router.get('/users', adminController.getUsers);
router.get('/store-owners', adminController.getStoreOwners);

module.exports = router;
