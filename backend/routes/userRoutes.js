const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, adminCheck } = require('../middleware/authMiddleware');

// ==========================================
// User Routes (Admin Only)
// ==========================================

// GET /api/users
router.get('/', protect, adminCheck, userController.getAllUsers);

module.exports = router;
