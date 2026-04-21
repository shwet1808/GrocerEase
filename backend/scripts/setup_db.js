// ============================================================================
// DATABASE SETUP SCRIPT — backend/scripts/setup_db.js
// ============================================================================
//
// WHAT DOES THIS SCRIPT DO?
// -------------------------
// This script creates all the database tables needed by GrocerEase.
// Run it ONCE when you first set up the project (or to recreate tables).
//
// HOW TO RUN:
//   cd backend
//   node scripts/setup_db.js
//
// WHAT IS "CREATE TABLE IF NOT EXISTS"?
// It creates the table ONLY if it doesn't already exist. This means you can
// safely run this script multiple times without destroying existing data.
//
// DATABASE RELATIONSHIPS (Entity-Relationship Diagram):
// =====================================================
//
//   ┌─────────┐       ┌──────────┐       ┌──────────────┐       ┌────────────┐
//   │  users  │──1:N──│  orders  │──1:N──│  order_items  │──N:1──│  products  │
//   │         │       │          │       │              │       │            │
//   │ id (PK) │       │ id (PK)  │       │ id (PK)      │       │ id (PK)    │
//   │ name    │       │ user_id  │──FK──→│ order_id     │──FK──→│ name       │
//   │ email   │       │ total    │       │ product_id   │──FK──→│ price      │
//   │ password│       │ status   │       │ quantity     │       │ stock_qty  │
//   │ role    │       │ created  │       │ price_at_time│       │ created    │
//   └─────────┘       └──────────┘       └──────────────┘       └────────────┘
//
//                                         ┌──────────────┐
//                                         │ transactions │  (standalone — no FKs)
//                                         │              │
//                                         │ id (PK)      │
//                                         │ type         │  ← 'income' or 'expense'
//                                         │ amount       │
//                                         │ description  │
//                                         │ created      │
//                                         └──────────────┘
//
// RELATIONSHIP TYPES:
//   1:N (One-to-Many) = One user can have MANY orders
//   N:1 (Many-to-One) = MANY order_items can reference ONE product
//   The order_items table is a "junction table" that creates a Many-to-Many
//   relationship between orders and products.
//
// WHAT ARE FOREIGN KEYS (FK)?
//   A foreign key is a column in one table that REFERENCES the primary key
//   in another table. It creates a link between the two tables and ensures
//   data integrity (you can't create an order for a user that doesn't exist).
// ============================================================================

require('dotenv').config();
const db = require('../config/db');

async function setupDatabase() {
  try {
    console.log('Starting database setup...');

    // ======================================================================
    // TABLE 1: Users
    // ======================================================================
    // Stores all registered users (both customers and admins).
    //
    // Key design choices:
    //   - email is UNIQUE: prevents duplicate accounts with the same email
    //   - password stores the HASHED version (never plain text)
    //   - role uses ENUM: restricts values to only 'admin' or 'customer'
    //   - created_at auto-fills: no need to manually set the registration date
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'customer') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created (or already exists).');

    // ======================================================================
    // TABLE 2: Products
    // ======================================================================
    // Stores all grocery items available in the store.
    //
    // Key design choices:
    //   - DECIMAL(10,2): handles money accurately (up to $99,999,999.99)
    //     Using FLOAT for money would cause rounding errors (e.g., $19.99 → $19.989999...)
    //   - stock_quantity defaults to 0: new products start with no stock
    //   - description is TEXT (not VARCHAR): allows longer product descriptions
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Products table created.');

    // ======================================================================
    // TABLE 3: Orders
    // ======================================================================
    // Stores the "header" of each order (who ordered, total cost, status).
    // The actual items in the order are stored in the order_items table.
    //
    // Key design choices:
    //   - FOREIGN KEY (user_id) REFERENCES users(id): links each order to a user
    //   - ON DELETE CASCADE: if a user account is deleted, their orders are
    //     automatically deleted too (cascading deletion)
    //   - status ENUM: restricts values to 'pending', 'completed', or 'cancelled'
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Orders table created.');

    // ======================================================================
    // TABLE 4: Order Items (Junction/Bridge Table)
    // ======================================================================
    // Stores the individual products within each order.
    // This is a "junction table" that creates a Many-to-Many relationship
    // between orders and products.
    //
    // WHY price_at_time?
    //   Product prices can change over time. If milk costs $3.99 today and
    //   $4.49 next month, we need to know what the customer ACTUALLY paid.
    //   This column freezes the price at the moment of purchase.
    //
    // Key design choices:
    //   - ON DELETE CASCADE (order_id): if an order is deleted, its items are too
    //   - ON DELETE RESTRICT (product_id): you CANNOT delete a product that has
    //     been ordered — this protects the integrity of order history
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price_at_time DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      )
    `);
    console.log('Order_items table created.');

    // ======================================================================
    // TABLE 5: Transactions
    // ======================================================================
    // Tracks financial transactions (income and expenses) for dashboard analytics.
    // This table is standalone — it has no foreign keys to other tables.
    //
    // Income entries are automatically created when orders are placed.
    // Expense entries would be manually added (e.g., purchasing new inventory).
    //
    // The dashboard uses this table to calculate:
    //   - Total income vs total expenses
    //   - Daily revenue/expense charts
    //   - Overall profit/loss
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('income', 'expense') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Transactions table created.');

    console.log('\nAll tables are ready! Setup complete.');
    process.exit(0);

  } catch (error) {
    console.error('Error setting up the database:', error);
    process.exit(1); // Exit with error code 1 to indicate failure
  }
}

// --- Execute the setup function ---
setupDatabase();
