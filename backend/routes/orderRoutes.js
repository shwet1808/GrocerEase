const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminCheck } = require('../middleware/authMiddleware');

// ==========================================
// ALL ORDERS ROUTES REQUIRE AUTHENTICATION
// Therefore, we can globally apply the 'protect' middleware 
// to this entire router instead of writing it on every line!
// ==========================================
router.use(protect);

// 1. Customer: Place an order
// POST /api/orders
router.post('/', orderController.createOrder);

// 2. Customer: Get their own order history
// GET /api/orders/myorders
router.get('/myorders', orderController.getMyOrders);

// 3. Admin: See all store orders
// We add the extra adminCheck here. (Remember 'protect' already ran globally above)
// GET /api/orders
router.get('/', adminCheck, orderController.getAllOrders);

module.exports = router;
