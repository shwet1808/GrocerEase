const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, adminCheck } = require('../middleware/authMiddleware'); // Import our security gates

// ==========================================
// PUBLIC ROUTES
// Anyone visiting the site can see products
// Examples:
// GET /api/products
// GET /api/products/5
// ==========================================
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// ==========================================
// ADMIN ONLY ROUTES
// Protect: Must be logged in (have a valid token)
// adminCheck: The user inside the token must have role = 'admin'
// Examples:
// POST /api/products (Create new)
// PUT /api/products/5 (Edit existing)
// DELETE /api/products/5 (Remove)
// ==========================================
router.post('/', protect, adminCheck, productController.createProduct);
router.put('/:id', protect, adminCheck, productController.updateProduct);
router.delete('/:id', protect, adminCheck, productController.deleteProduct);

module.exports = router;
