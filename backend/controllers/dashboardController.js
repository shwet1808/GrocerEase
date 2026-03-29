const db = require('../config/db');

// ==========================================
// GET DASHBOARD STATS (Admin Only)
// GET /api/dashboard
// ==========================================
exports.getDashboardStats = async (req, res) => {
  try {
    // We can run multiple SQL queries at the exact same time using Promise.all
    // This makes our endpoint super fast because it doesn't wait for query 1 to finish before starting query 2.
    const [
      [productCount],
      [orderCount],
      [revenueResult],
      [lowStockItems],
      [transactions]
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as total FROM products'),
      db.query('SELECT COUNT(*) as total FROM orders'),
      db.query("SELECT SUM(total_amount) as revenue FROM orders WHERE status = 'completed'"),
      db.query('SELECT id, name, stock_quantity FROM products WHERE stock_quantity < 10 ORDER BY stock_quantity ASC'),
      db.query('SELECT type, SUM(amount) as total FROM transactions GROUP BY type')
    ]);

    // Format the raw SQL results into a clean Javascript object for the frontend
    const totalProducts = productCount[0].total || 0;
    const totalOrders = orderCount[0].total || 0;
    const totalRevenue = revenueResult[0].revenue || 0;

    // Calculate Profit/Loss from the transactions table
    let income = 0;
    let expense = 0;
    
    // The transactions array might look like: [{ type: 'income', total: 500 }, { type: 'expense', total: 200 }]
    transactions.forEach(t => {
      if (t.type === 'income') income = Number(t.total);
      if (t.type === 'expense') expense = Number(t.total);
    });
    
    const profit = income - expense;

    // Send the final compiled report to the frontend
    res.status(200).json({
      overview: {
        totalProducts,
        totalOrders,
        totalRevenue: Number(totalRevenue),
        profit
      },
      lowStockAlerts: lowStockItems
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error while fetching analytics" });
  }
};
