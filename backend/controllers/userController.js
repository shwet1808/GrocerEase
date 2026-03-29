const db = require('../config/db');

// ==========================================
// GET ALL CUSTOMERS (Admin Only)
// GET /api/users
// ==========================================
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users. We specifically EXCLUDE passwords for security!
    // We format the date nicely for the frontend.
    const [users] = await db.query(`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        DATE_FORMAT(created_at, '%b %d, %Y') as joined_date 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    // Calculate 2 quick stats for the CRM header
    const totalCustomers = users.filter(u => u.role === 'customer').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;

    res.status(200).json({
      metrics: { totalCustomers, totalAdmins },
      users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error fetching customer data" });
  }
};
