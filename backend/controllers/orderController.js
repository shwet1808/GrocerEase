// ============================================================================
// ORDER CONTROLLER — backend/controllers/orderController.js
// ============================================================================
//
// This controller handles all HTTP requests related to customer orders.
// The heavy lifting (database transactions, stock verification, etc.)
// is handled by the order service — this file just manages the HTTP layer.
// ============================================================================

const orderService = require('../services/orderService');

// ============================================================================
// 1. CREATE NEW ORDER (Protected — logged-in customers only)
// POST /api/orders
// ============================================================================
// Places a new order for the currently logged-in customer.
// The customer's identity is extracted from their JWT token by the auth middleware
// and stored in req.user.userId — they don't need to tell us who they are.
//
// Expected request body:
//   { "items": [{ "productId": 1, "quantity": 2 }, { "productId": 3, "quantity": 1 }] }
//
// Success response (201 Created):
//   { "message": "Order placed successfully!", "orderId": 42 }
//
// Error responses:
//   400 — no items provided, product not found, or insufficient stock
// ============================================================================
exports.createOrder = async (req, res) => {
  try {
    // Extract the items list from the request body and the user ID from the JWT token
    const { items } = req.body;
    const userId = req.user.userId;

    // Delegate the complex order logic to the service
    const result = await orderService.placeOrder(userId, items);

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: result.orderId
    });

  } catch (error) {
    // The order service throws descriptive errors for stock issues, missing products, etc.
    console.error('Order Transaction Failed:', error);
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({
      message: error.message || 'Failed to place order'
    });
  }
};


// ============================================================================
// 2. GET LOGGED-IN USER'S ORDERS (Protected — logged-in users only)
// GET /api/orders/myorders
// ============================================================================
// Returns the order history for the currently logged-in customer.
// The user ID comes from the JWT token, so users can ONLY see their own orders.
//
// Success response (200 OK):
//   [{ id: 1, user_id: 5, total_amount: 25.99, status: "completed", ... }, ...]
// ============================================================================
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.fetchOrdersByUser(req.user.userId);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching my orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// ============================================================================
// 3. GET ALL ORDERS (Admin Only)
// GET /api/orders
// ============================================================================
// Returns every order in the system with the customer's name attached.
// Only admins can access this (enforced by the adminCheck middleware in the route file).
//
// Success response (200 OK):
//   [{ id: 1, user_name: "John Doe", total_amount: 25.99, status: "completed", ... }, ...]
// ============================================================================
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.fetchAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================================================
// 4. CREATE ORDER ON BEHALF OF CUSTOMER (Admin Only)
// POST /api/orders/admin
// ============================================================================
exports.createAdminOrder = async (req, res) => {
  try {
    const { userId, items } = req.body;
    if (!userId) throw new Error("userId is required for admin bill generation.");
    const result = await orderService.placeOrder(userId, items);
    res.status(201).json({
      message: 'Bill generated successfully!',
      orderId: result.orderId
    });
  } catch (error) {
    console.error('Admin Order Transaction Failed:', error);
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ message: error.message || 'Failed to generate bill' });
  }
};

// ============================================================================
// 5. RETURN ORDER (User returns their own order)
// PUT /api/orders/:id/return
// ============================================================================
exports.returnOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    // Admins can return unconditionally, normal users returning their own order
    const isUserAdmin = req.user.role === 'admin';
    const userIdToPass = isUserAdmin ? null : req.user.userId;

    const result = await orderService.returnOrder(orderId, userIdToPass);
    res.status(200).json({ message: 'Order returned successfully', ...result });
  } catch (error) {
    console.error('Order Return Failed:', error);
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ message: error.message || 'Failed to return order' });
  }
};
