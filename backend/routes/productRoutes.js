// ============================================================================
// PRODUCT ROUTES — backend/routes/productRoutes.js
// ============================================================================
//
// This file maps product-related URLs to their controller functions.
// All routes in this file are prefixed with /api/products (set in server.js).
//
// MIDDLEWARE CHAIN EXPLAINED:
// --------------------------
// When you see: router.post('/', protect, adminCheck, productController.createProduct)
// It means the request goes through 3 functions IN ORDER:
//
//   1. protect       → "Are you logged in? Show me your JWT token."
//   2. adminCheck    → "Okay you're logged in, but are you an admin?"
//   3. createProduct → "Great, you're an authorized admin. Let me create the product."
//
// If any function in the chain fails, the rest don't execute.
// This is how we enforce security without duplicating code.
// ============================================================================

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, adminCheck } = require('../middleware/authMiddleware');

// ============================================================================
// PUBLIC ROUTES — Anyone can view products (no login needed)
// ============================================================================

// GET /api/products — Get the full list of all products
router.get('/', productController.getAllProducts);

// GET /api/products/:id — Get a single product by its ID
// The ":id" is a URL parameter. For example: /api/products/5 → req.params.id = "5"
router.get('/:id', productController.getProductById);

// ============================================================================
// ADMIN-ONLY ROUTES — Must be logged in AND have the "admin" role
// ============================================================================
// Each route passes through TWO middleware functions before reaching the controller:
//   protect    → verifies the JWT token (authentication)
//   adminCheck → verifies the user's role is "admin" (authorization)

// POST /api/products — Create a new product
router.post('/', protect, adminCheck, productController.createProduct);

// PUT /api/products/:id — Update an existing product
router.put('/:id', protect, adminCheck, productController.updateProduct);

// DELETE /api/products/:id — Delete a product (will fail if it has existing orders)
router.delete('/:id', protect, adminCheck, productController.deleteProduct);

module.exports = router;
