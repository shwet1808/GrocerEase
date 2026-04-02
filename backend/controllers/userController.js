// ============================================================================
// USER CONTROLLER — backend/controllers/userController.js
// ============================================================================
//
// This controller handles HTTP requests related to user management.
// Currently, it provides admin-only access to view all registered users.
// ============================================================================

const userService = require('../services/userService');

// ============================================================================
// GET ALL CUSTOMERS (Admin Only)
// GET /api/users
// ============================================================================
// Returns all registered users with their details and quick summary metrics.
// Used in the admin panel's CRM (Customer Relationship Management) section.
//
// Only admins can access this (enforced by protect + adminCheck middleware).
//
// Success response (200 OK):
//   {
//     "metrics": { "totalCustomers": 9, "totalAdmins": 1 },
//     "users": [{ "id": 1, "name": "John", "email": "...", "role": "customer", "joined_date": "Mar 15, 2026" }]
//   }
// ============================================================================
exports.getAllUsers = async (req, res) => {
  try {
    const result = await userService.fetchAllUsers();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching customer data' });
  }
};
