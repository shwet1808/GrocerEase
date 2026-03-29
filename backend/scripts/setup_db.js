require('dotenv').config();
const db = require('../config/db');

async function setupDatabase() {
  try {
    console.log("Starting database setup...");

    // 1. Users Table
    // This table stores customer and admin information.
    // The email must be unique, meaning two users cannot have the same email.
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
    console.log("Users table created (or already exists).");

    // 2. Products Table
    // This holds all the grocery items.
    // DECIMAL(10,2) handles currency gracefully (up to 10 digits total, 2 after the decimal point).
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
    console.log("Products table created.");

    // 3. Orders Table
    // An order belongs to ONE user. This is a One-to-Many (1:N) relationship.
    // user_id is the "Foreign Key" that links to the users table's primary key.
    // ON DELETE CASCADE: If a user deletes their account, their orders are automatically deleted.
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
    console.log("Orders table created.");

    // 4. Order Items Table
    // An order can have MANY products. A product can be in MANY orders.
    // This is a Many-to-Many (N:M) relationship.
    // The "order_items" table bridges the gap between orders and products.
    // ON DELETE RESTRICT (for product): You cannot delete a product from the database
    // if someone has already ordered it (for tracking record integrity).
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
    console.log("Order_items table created.");

    // 5. Transactions Table
    // This tracks income vs expenses purely for dashboard charts.
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('income', 'expense') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Transactions table created.");

    console.log("All tables are ready! Setup complete.");
    process.exit(0);

  } catch (error) {
    console.error("Error setting up the database:", error);
    process.exit(1);
  }
}

// Execute the function
setupDatabase();
