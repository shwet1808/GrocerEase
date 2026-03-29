const db = require('../config/db');

// ==========================================
// 1. CREATE NEW ORDER (Protected - Customer only)
// POST /api/orders
// ==========================================
exports.createOrder = async (req, res) => {
  // req.body.items should look like: [{ productId: 1, quantity: 2 }, { productId: 3, quantity: 1 }]
  const { items } = req.body; 

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No order items provided" });
  }

  // Get a dedicated connection from the pool strictly for this transaction
  const connection = await db.getConnection();

  try {
    // ----------------------------------------------------
    // START TRANSACTION
    // ----------------------------------------------------
    // We are about to modify THREE different tables (orders, order_items, products).
    // If our server crashes right in the middle, we don't want someone to be charged 
    // for an order, but the stock never goes down. A transaction ensures ALL steps 
    // succeed, or NONE of them do (Rollback).
    await connection.beginTransaction();

    let totalAmount = 0;
    const processedItems = [];

    // STEP 1: Verify Stock & Calculate Total Price
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // We lock this specific product row using "FOR UPDATE" so no one else can buy it at the exact same millisecond
      const [productRows] = await connection.query(
        'SELECT * FROM products WHERE id = ? FOR UPDATE', 
        [item.productId]
      );

      if (productRows.length === 0) {
        throw new Error(`Product ID ${item.productId} not found.`);
      }

      const product = productRows[0];

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}. Only ${product.stock_quantity} left!`);
      }

      // Calculate running total using the exact DB price (never trust frontend prices, users can hack them!)
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      // Save the details for the next step so we don't have to query the database again
      processedItems.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtTime: product.price
      });
    }

    // STEP 2: Create the main Order record
    // Notice we use `req.user.userId` which was securely extracted by our authMiddleware!
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [req.user.userId, totalAmount, 'completed'] // Auto-setting to completed for simplicity
    );
    const newOrderId = orderResult.insertId;

    // STEP 3: Create Order Items and Reduce Stock
    for (let i = 0; i < processedItems.length; i++) {
      const item = processedItems[i];

      // Record exactly what was in this order
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
        [newOrderId, item.productId, item.quantity, item.priceAtTime]
      );

      // Reduce the actual inventory level on the shelf
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    // STEP 4: Record this as an income transaction for the dashboard
    await connection.query(
      'INSERT INTO transactions (type, amount, description) VALUES (?, ?, ?)',
      ['income', totalAmount, `Order #${newOrderId} placed by Customer ID ${req.user.userId}`]
    );

    // ----------------------------------------------------
    // COMMIT TRANSACTION
    // ----------------------------------------------------
    // Everything was successful! Save it all permanently.
    await connection.commit();
    res.status(201).json({ message: "Order placed successfully!", orderId: newOrderId });

  } catch (error) {
    // ----------------------------------------------------
    // ROLLBACK TRANSACTION
    // ----------------------------------------------------
    // Someone tried to buy 10 milks but we only had 2. Rollback entirely!
    await connection.rollback();
    console.error("Order Transaction Failed:", error);
    res.status(400).json({ message: error.message || "Failed to place order" });
  } finally {
    // Always release the connection back to the pool to prevent memory leaks
    connection.release();
  }
};


// ==========================================
// 2. GET LOGGED IN USER'S ORDERS (Protected)
// GET /api/orders/myorders
// ==========================================
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching my orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ==========================================
// 3. GET ALL ORDERS (Admin Only)
// GET /api/orders
// ==========================================
exports.getAllOrders = async (req, res) => {
  try {
    // A cool SQL JOIN to get the customer's name attached to the order!
    const [orders] = await db.query(`
      SELECT orders.*, users.name as user_name 
      FROM orders 
      JOIN users ON orders.user_id = users.id 
      ORDER BY orders.created_at DESC
    `);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};
