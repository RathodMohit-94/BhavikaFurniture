const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer to use memory storage instead of disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

// File upload route
router.post('/upload', upload.single('image'), adminController.uploadImage);

// Image serve route
router.get('/images/:id', adminController.getImage);

// Purpose-built commerce administration routes
router.get('/dashboard', adminController.getDashboardAnalytics);
router.get('/inventory/low-stock', adminController.getInventoryAlerts);
router.patch('/orders/:id/workflow', adminController.updateOrderWorkflow);

// Dynamic routes for admin entities
router.get('/config/:entity', adminController.getEntityConfig);
router.get('/data/:entity', adminController.getEntityData);
router.post('/data/:entity', adminController.createEntityData);
router.put('/data/:entity/:id', adminController.updateEntityData);
router.delete('/data/:entity/:id', adminController.deleteEntityData);
router.post('/data/:entity/bulk-status', adminController.bulkUpdateStatus);

module.exports = router;
