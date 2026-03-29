const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, adminCheck } = require('../middleware/authMiddleware');

// ==========================================
// Dashboard Routes
// Only an Admin should be able to see the store's complete financial and stock analytics.
// ==========================================

// GET /api/dashboard 
router.get('/', protect, adminCheck, dashboardController.getDashboardStats);

module.exports = router;
