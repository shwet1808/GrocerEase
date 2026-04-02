// ============================================================================
// USER ROUTES — backend/routes/userRoutes.js
// ============================================================================
//
// This file maps user management endpoints to their controller functions.
// All routes are prefixed with /api/users (set in server.js).
//
// Currently, user management is admin-only. Regular customers can view
// their own info through the auth/login response, but only admins can
// see a list of ALL users for customer relationship management (CRM).
// ============================================================================

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, adminCheck } = require('../middleware/authMiddleware');

// GET /api/users — Get all registered users with metrics (admin only)
// Returns: { metrics: { totalCustomers, totalAdmins }, users: [...] }
router.get('/', protect, adminCheck, userController.getAllUsers);

module.exports = router;
