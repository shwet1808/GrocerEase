// ============================================================================
// DASHBOARD ROUTES — backend/routes/dashboardRoutes.js
// ============================================================================
//
// This file maps the dashboard analytics endpoint to its controller.
// All routes are prefixed with /api/dashboard (set in server.js).
//
// This is the most restricted area of the application:
//   1. protect    → Must be logged in (valid JWT token)
//   2. adminCheck → Must be an admin (role = 'admin')
//
// Regular customers should never see the store's financial data,
// inventory alerts, or revenue charts — that's confidential business data.
// ============================================================================

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, adminCheck } = require('../middleware/authMiddleware');

// GET /api/dashboard — Get complete store analytics (admin only)
// Returns: product count, order count, revenue, profit, low stock alerts, sales graph data
router.get('/', protect, adminCheck, dashboardController.getDashboardStats);

module.exports = router;
