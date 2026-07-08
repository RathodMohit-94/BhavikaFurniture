const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/catalog', adminController.getPublicCatalog);
router.get('/content/:entity', adminController.getPublicContent);
router.post('/coupons/validate', adminController.validateCoupon);
router.post('/orders', adminController.createStoreOrder);

module.exports = router;
