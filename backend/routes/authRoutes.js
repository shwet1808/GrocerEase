// ============================================================================
// AUTH ROUTES — backend/routes/authRoutes.js
// ============================================================================
//
// WHAT IS A ROUTE FILE?
// ---------------------
// A route file is like a "traffic sign" at an intersection. It looks at
// incoming HTTP requests and directs them to the right controller function.
//
// This file handles all routes starting with /api/auth:
//   POST /api/auth/signup  →  authController.signup
//   POST /api/auth/login   →  authController.login
//
// WHY ARE THESE "POST" REQUESTS?
// In HTTP, different methods have different meanings:
//   GET    = "I want to READ data"      (e.g., viewing products)
//   POST   = "I want to CREATE data"    (e.g., creating a user account)
//   PUT    = "I want to UPDATE data"    (e.g., editing a product)
//   DELETE = "I want to DELETE data"    (e.g., removing a product)
//
// Signup and Login both send sensitive data (passwords), so they use POST.
// POST requests send data in the request BODY (hidden), not in the URL (visible).
// ============================================================================

const express = require('express');
const router = express.Router();  // Create a mini-router for auth-specific routes
const authController = require('../controllers/authController');

// --- Public Routes (no authentication required) ---
// Anyone can sign up for a new account
router.post('/signup', authController.signup);

// Anyone can attempt to log in
router.post('/login', authController.login);

// Export the router so server.js can mount it at /api/auth
module.exports = router;
