// ============================================================================
// ORDER SERVICE — backend/services/orderService.js
// ============================================================================
//
// This service handles all business logic related to customer orders:
//   - Placing a new order (the most complex operation in the entire app!)
//   - Fetching a specific user's orders
//   - Fetching all orders (for the admin panel)
//
// THE BIG CONCEPT — DATABASE TRANSACTIONS:
// -----------------------------------------
// Placing an order involves modifying MULTIPLE tables at once:
//   1. Create an entry in the 'orders' table
//   2. Create entries in the 'order_items' table (one per product)
//   3. Reduce stock in the 'products' table
//   4. Log income in the 'transactions' table
//
// What if the server crashes BETWEEN step 2 and step 3?
//   → The customer gets charged, but the stock never goes down!
//   → That's data corruption, and it's REALLY bad.
//
// A "Transaction" solves this by treating all 4 steps as ONE atomic operation:
//   - If ALL steps succeed → COMMIT (save everything permanently)
//   - If ANY step fails    → ROLLBACK (undo everything, as if nothing happened)
//
// Think of it like a bank transfer: either BOTH accounts update, or NEITHER does.
// ============================================================================

const db = require('../config/db');

// ============================================================================
// PLACE A NEW ORDER
// ============================================================================
// This is the most complex function in the entire backend. It:
//   1. Verifies that every requested product exists and has enough stock
//   2. Calculates the total price using DATABASE prices (never trust frontend prices!)
//   3. Creates the order record
//   4. Creates individual order item records
//   5. Reduces stock for each purchased product
//   6. Logs the income as a financial transaction
//
// All of the above happens inside a database transaction for safety.
//
// Parameters:
//   - userId (number): The ID of the customer placing the order (from JWT token)
//   - items  (array):  List of items to order
//     Example: [{ productId: 1, quantity: 2 }, { productId: 3, quantity: 1 }]
//
// Returns: { orderId: <number> }
// Throws:  Error if a product doesn't exist, stock is insufficient, or DB fails
// ============================================================================
const placeOrder = async (userId, items) => {

  // --- Validation: Ensure items were provided ---
  if (!items || items.length === 0) {
    const error = new Error('No order items provided');
    error.statusCode = 400;
    throw error;
  }

  // --- Get a DEDICATED connection from the pool ---
  // We need a single connection (not the general pool) because transactions
  // are tied to a specific connection. If we used the pool directly, different
  // queries might run on different connections, breaking the transaction.
  const connection = await db.getConnection();

  try {
    // ╔══════════════════════════════════════════╗
    // ║         START TRANSACTION                ║
    // ╚══════════════════════════════════════════╝
    // From this point on, NOTHING is saved to the database permanently
    // until we call connection.commit(). If anything goes wrong,
    // connection.rollback() will undo ALL changes made in this block.
    await connection.beginTransaction();

    let totalAmount = 0;         // Running total for the entire order
    const processedItems = [];   // Store verified item details for later steps

    // ── STEP 1: Verify Stock & Calculate Total Price ──────────────────
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // "FOR UPDATE" is a special SQL clause that LOCKS this specific row
      // in the database. This prevents a race condition where two customers
      // try to buy the last item at the exact same millisecond.
      // While this row is locked, any other query trying to read it with
      // FOR UPDATE will WAIT until our transaction finishes.
      const [productRows] = await connection.query(
        'SELECT * FROM products WHERE id = ? FOR UPDATE',
        [item.productId]
      );

      // Check if the product exists
      if (productRows.length === 0) {
        throw new Error(`Product ID ${item.productId} not found.`);
      }

      const product = productRows[0];

      // Check if there's enough stock on the shelf
      if (product.stock_quantity < item.quantity) {
        throw new Error(
          `Not enough stock for ${product.name}. Only ${product.stock_quantity} left!`
        );
      }

      // Calculate the price for this line item using the DATABASE price.
      // SECURITY NOTE: Never use prices sent from the frontend!
      // A malicious user could modify the JavaScript in their browser
      // to send a price of $0.01 for a $50 item.
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      // Save verified details so we don't need to query the DB again in Step 3
      processedItems.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtTime: product.price  // "Price at time of purchase" — products' prices can change later
      });
    }

    // ── STEP 2: Create the main Order record ──────────────────────────
    // req.user.userId was securely extracted by our auth middleware from the JWT token
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [userId, totalAmount, 'completed']  // Auto-setting to 'completed' for simplicity
    );
    const newOrderId = orderResult.insertId;

    // ── STEP 3: Create Order Items & Reduce Stock ─────────────────────
    for (let i = 0; i < processedItems.length; i++) {
      const item = processedItems[i];

      // Record exactly what was in this order (the "receipt")
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
        [newOrderId, item.productId, item.quantity, item.priceAtTime]
      );

      // Reduce the actual inventory level on the shelf
      // We use SET stock_quantity = stock_quantity - ? (relative update)
      // instead of SET stock_quantity = <new_value> (absolute update)
      // to avoid race conditions with concurrent orders
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    // ── STEP 4: Record the income transaction for the dashboard ───────
    await connection.query(
      'INSERT INTO transactions (type, amount, description) VALUES (?, ?, ?)',
      ['income', totalAmount, `Order #${newOrderId} placed by Customer ID ${userId}`]
    );

    // ╔══════════════════════════════════════════╗
    // ║         COMMIT TRANSACTION               ║
    // ╚══════════════════════════════════════════╝
    // Everything succeeded! Save all changes permanently to the database.
    await connection.commit();

    return { orderId: newOrderId };

  } catch (error) {
    // ╔══════════════════════════════════════════╗
    // ║         ROLLBACK TRANSACTION             ║
    // ╚══════════════════════════════════════════╝
    // Something went wrong! Undo ALL changes made during this transaction.
    // Example: Customer tried to buy 10 milks but we only had 2.
    // The order is cancelled cleanly — no partial data left in the database.
    await connection.rollback();
    throw error;  // Re-throw so the controller can send the error response

  } finally {
    // ALWAYS release the connection back to the pool, even if an error occurred.
    // If we don't do this, the connection stays "checked out" forever,
    // and eventually the pool runs out of available connections (a memory leak).
    connection.release();
  }
};


// ============================================================================
// FETCH ORDERS FOR A SPECIFIC USER
// ============================================================================
// Returns all orders placed by a specific customer, newest first.
//
// Parameters:
//   - userId (number): The user's ID (extracted from their JWT token)
//
// Returns: Array of order objects
// ============================================================================
const fetchOrdersByUser = async (userId) => {
  const [orders] = await db.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return orders;
};


// ============================================================================
// FETCH ALL ORDERS (Admin View)
// ============================================================================
// Returns every order in the system with the customer's name attached.
// This is used in the admin panel to see all store activity.
//
// We use a SQL JOIN to combine data from two tables:
//   - 'orders' table: has the order details (amount, status, date)
//   - 'users' table: has the customer's name
//
// The JOIN connects them using: orders.user_id = users.id
//
// Returns: Array of order objects with an extra 'user_name' field
// ============================================================================
const fetchAllOrders = async () => {
  const [orders] = await db.query(`
    SELECT orders.*, users.name as user_name
    FROM orders
    JOIN users ON orders.user_id = users.id
    ORDER BY orders.created_at DESC
  `);
  return orders;
};


// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  placeOrder,
  fetchOrdersByUser,
  fetchAllOrders
};
