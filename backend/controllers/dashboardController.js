// ============================================================================
// DASHBOARD CONTROLLER — backend/controllers/dashboardController.js
// ============================================================================
//
// This controller handles the Admin Dashboard endpoint.
// All the complex SQL queries and data formatting are handled by the
// dashboard service — this file simply passes the request through.
// ============================================================================

const dashboardService = require('../services/dashboardService');

// ============================================================================
// GET DASHBOARD STATS (Admin Only)
// GET /api/dashboard
// ============================================================================
// Returns a complete analytics overview for the store admin:
//   - overview:       Total products, orders, revenue, and profit
//   - lowStockAlerts: Products with less than 10 units remaining
//   - salesGraph:     Daily revenue/expense data for charting
//
// Only admins can access this endpoint (enforced by protect + adminCheck middleware).
//
// Success response (200 OK):
//   {
//     "overview": { "totalProducts": 1000, "totalOrders": 20, "totalRevenue": 500, "profit": 500 },
//     "lowStockAlerts": [{ "id": 42, "name": "Low Stock Item", "stock_quantity": 3 }],
//     "salesGraph": [{ "date": "Mar 15", "revenue": 100, "expenses": 20, "profit": 80 }]
//   }
// ============================================================================
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await dashboardService.getStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
};
