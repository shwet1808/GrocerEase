// ============================================================================
// DASHBOARD SERVICE — backend/services/dashboardService.js
// ============================================================================
//
// This service handles the business logic for the Admin Dashboard.
// It aggregates data from multiple database tables to provide a
// real-time overview of the store's health:
//
//   - Total products in the store
//   - Total orders placed
//   - Total revenue generated
//   - Profit/Loss calculation (income minus expenses)
//   - Products with dangerously low stock (< 10 units)
//   - Sales graph data for visualizing trends over time
//
// KEY CONCEPT — Promise.all():
// -----------------------------
// Instead of running 6 SQL queries one after another (which would be slow),
// we run them ALL at the same time using Promise.all().
//
// Sequential:  Query1 (100ms) → Query2 (100ms) → ... → Total: ~600ms
// Parallel:    All 6 queries start together → Total: ~100ms (speed of slowest one)
//
// This makes the dashboard load almost instantly, even with large datasets.
// ============================================================================

const db = require('../config/db');

// ============================================================================
// GET DASHBOARD STATISTICS
// ============================================================================
// Runs 6 database queries in parallel and compiles the results into a
// structured response object for the frontend dashboard page.
//
// Returns: {
//   overview:        { totalProducts, totalOrders, totalRevenue, profit },
//   lowStockAlerts:  [{ id, name, stock_quantity }, ...],
//   salesGraph:      [{ date, revenue, expenses, profit }, ...]
// }
// ============================================================================
const getStats = async () => {

  // --- Run all 6 queries simultaneously using Promise.all ---
  // Promise.all() takes an array of Promises and waits for ALL of them to finish.
  // The results come back in the SAME ORDER as the input array.
  // We use array destructuring to give each result a meaningful name.
  const [
    [productCount],       // Result of query 1: total number of products
    [orderCount],         // Result of query 2: total number of orders
    [revenueResult],      // Result of query 3: sum of all completed order amounts
    [lowStockItems],      // Result of query 4: products with stock < 10
    [transactions],       // Result of query 5: income vs expense totals
    [salesChartData]      // Result of query 6: daily revenue/expense/profit for graphing
  ] = await Promise.all([

    // Query 1: How many products do we have in total?
    // COUNT(*) counts every row in the table.
    db.query('SELECT COUNT(*) as total FROM products'),

    // Query 2: How many orders have been placed in total?
    db.query('SELECT COUNT(*) as total FROM orders'),

    // Query 3: What's our total revenue from completed orders?
    // SUM() adds up all values in a column. We only count 'completed' orders.
    db.query("SELECT SUM(total_amount) as revenue FROM orders WHERE status = 'completed'"),

    // Query 4: Which products have dangerously low stock?
    // We consider anything below 10 units as "low stock" — an alert for the manager.
    // ORDER BY stock_quantity ASC = show the most critical items first (lowest stock).
    db.query(
      'SELECT id, name, stock_quantity FROM products WHERE stock_quantity < 10 ORDER BY stock_quantity ASC'
    ),

    // Query 5: Total income vs total expenses (grouped by transaction type)
    // GROUP BY type gives us separate totals for 'income' and 'expense'.
    // Result example: [{ type: 'income', total: 5000 }, { type: 'expense', total: 2000 }]
    db.query('SELECT type, SUM(amount) as total FROM transactions GROUP BY type'),

    // Query 6: Daily sales data for the chart on the frontend
    // This query is more complex — it calculates revenue, expenses, and profit
    // for each day, formatted nicely for the Recharts graph component.
    //
    // DATE_FORMAT: converts a timestamp like "2026-03-15 14:30:00" into "Mar 15"
    // CASE WHEN: a conditional — only sum the amount if it matches the type
    // LIMIT 30: only show the last 30 days to keep the graph readable
    db.query(`
      SELECT
        DATE_FORMAT(created_at, '%b %d') as date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
        (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) as profit
      FROM transactions
      GROUP BY date
      ORDER BY MAX(created_at) ASC
      LIMIT 30
    `)
  ]);

  // --- Format the raw SQL results into clean JavaScript values ---
  // SQL aggregation functions like COUNT() and SUM() return the result
  // inside an array of objects. We extract the actual numbers here.
  // The "|| 0" fallback handles cases where the table is empty (SUM returns null).
  const totalProducts = productCount[0].total || 0;
  const totalOrders = orderCount[0].total || 0;
  const totalRevenue = revenueResult[0].revenue || 0;

  // --- Calculate Profit/Loss from the transactions table ---
  // We loop through the grouped transactions to find income and expense totals.
  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    if (t.type === 'income') income = Number(t.total);
    if (t.type === 'expense') expense = Number(t.total);
  });

  const profit = income - expense;

  // --- Return the compiled dashboard data ---
  // This object structure matches exactly what the frontend expects.
  return {
    overview: {
      totalProducts,
      totalOrders,
      totalRevenue: Number(totalRevenue),
      profit
    },
    lowStockAlerts: lowStockItems,
    salesGraph: salesChartData  // Feeds directly into the Recharts graph component
  };
};


// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  getStats
};
