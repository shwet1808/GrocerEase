// ============================================================================
// ORDER ROUTES — backend/routes/orderRoutes.js
// ============================================================================
//
// This file maps order-related URLs to their controller functions.
// All routes in this file are prefixed with /api/orders (set in server.js).
//
// SPECIAL PATTERN — router.use(protect):
// ----------------------------------------
// Instead of adding 'protect' to every single route individually, we use
// router.use(protect) to apply it ONCE to ALL routes in this file.
//
// This is called "global middleware" for this router. It means:
//   "Every single route in this file requires the user to be logged in."
//
// Think of it like a nightclub that checks IDs at the front door —
// you don't need to check IDs at every table inside.
// ============================================================================

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminCheck } = require('../middleware/authMiddleware');

// ============================================================================
// Apply authentication to ALL order routes
// ============================================================================
// Every route below this line requires a valid JWT token.
// If a user tries to access any order endpoint without logging in,
// the 'protect' middleware will reject them with a 401 Unauthorized response.
router.use(protect);

// ============================================================================
// CUSTOMER ROUTES — Any logged-in user can access these
// ============================================================================

// POST /api/orders — Place a new order
// The customer's ID is automatically extracted from their JWT token
router.post('/', orderController.createOrder);

// GET /api/orders/myorders — View your own order history
// NOTE: This route MUST come before '/' to avoid being matched as an :id parameter
router.get('/myorders', orderController.getMyOrders);

// ============================================================================
// ADMIN-ONLY ROUTE — Requires admin role on top of authentication
// ============================================================================

// GET /api/orders — View ALL orders from all customers (admin panel)
// The extra 'adminCheck' middleware ensures only admins can see everyone's orders
router.get('/', adminCheck, orderController.getAllOrders);

module.exports = router;
