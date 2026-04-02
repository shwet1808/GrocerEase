// ============================================================================
// DATABASE SEED SCRIPT — backend/scripts/seed_db.js
// ============================================================================
//
// WHAT IS "SEEDING"?
// ------------------
// Seeding means filling a database with fake but realistic data so you can
// test your application without having to manually create every user, product,
// and order one by one. It's like setting up a demo environment.
//
// HOW TO RUN:
//   cd backend
//   node scripts/seed_db.js
//
// WHAT THIS SCRIPT CREATES:
//   - 10 users (1 admin + 9 customers)
//   - 1000 randomly generated grocery products
//   - 20 realistic orders with associated order items and transactions
//
// DEMO CREDENTIALS (after seeding):
//   Admin Email:     admin@demo.com
//   Admin Password:  password123
//   Customer Email:  customer1@demo.com (through customer9@demo.com)
//   Customer Pwd:    password123
//
// WARNING: This script DELETES all existing data before inserting new data!
//          Only run this in development, never in production.
// ============================================================================

require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ============================================================================
// Helper Functions for Random Data Generation
// ============================================================================

// Returns a random integer between min and max (inclusive)
// Example: randomInt(1, 10) could return 1, 2, 3, ... or 10
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Returns a random decimal number with 2 decimal places (for prices)
// Example: randomFloat(1.99, 29.99) could return "12.45"
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

// Word banks for generating realistic product names
const adjectives = ['Organic', 'Fresh', 'Crisp', 'Premium', 'Local', 'Imported', 'Value', 'Artisanal', 'Gluten-Free', 'Vegan'];
const nouns = ['Apples', 'Milk', 'Bread', 'Eggs', 'Chicken', 'Beef', 'Pasta', 'Rice', 'Tomatoes', 'Onions', 'Potatoes', 'Cheese', 'Yogurt', 'Coffee', 'Tea', 'Water', 'Cereal', 'Honey', 'Peanut Butter', 'Olive Oil'];


// ============================================================================
// Main Seeding Function
// ============================================================================
async function seedDatabase() {
  try {
    console.log('Seeding database... This might take a few seconds.');

    // ====================================================================
    // STEP 1: Clear all existing data
    // ====================================================================
    // We need to TRUNCATE (completely empty) all tables before inserting fresh data.
    //
    // PROBLEM: Tables have foreign key constraints (e.g., order_items references products).
    //   MySQL won't let you truncate a table that another table depends on.
    //
    // SOLUTION: Temporarily disable foreign key checks, truncate everything,
    //   then re-enable checks. This is safe because we're emptying ALL tables.
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE order_items');
    await db.query('TRUNCATE TABLE orders');
    await db.query('TRUNCATE TABLE transactions');
    await db.query('TRUNCATE TABLE products');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Old data cleared.');

    // ====================================================================
    // STEP 2: Create 10 Users (1 Admin + 9 Customers)
    // ====================================================================
    // All users share the same password ('password123') for easy testing.
    // In production, every user would have their own unique password.
    console.log('Creating 10 users...');

    // Hash the password ONCE and reuse it for all users (saves time during seeding)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Build a 2D array for bulk insertion
    // Each inner array represents one row: [name, email, password, role]
    const usersData = [];
    usersData.push(['Admin User', 'admin@demo.com', hashedPassword, 'admin']); // User ID 1

    for (let i = 1; i <= 9; i++) {
      usersData.push([`Customer ${i}`, `customer${i}@demo.com`, hashedPassword, 'customer']); // User IDs 2-10
    }

    // BULK INSERT: Instead of running 10 separate INSERT queries,
    // we use "VALUES ?" with a nested array to insert all rows in a single query.
    // This is MUCH faster — one round trip to the database instead of ten.
    await db.query('INSERT INTO users (name, email, password, role) VALUES ?', [usersData]);

    // ====================================================================
    // STEP 3: Create 1000 Randomly Generated Products
    // ====================================================================
    // We combine random adjectives and nouns to create realistic product names.
    // Stock is randomized between 0-300 — statistically, some will land below 10,
    // which automatically tests the "Low Stock Alert" feature on the dashboard!
    console.log('Generating 1000 grocery products...');

    const productsData = [];
    for (let i = 1; i <= 1000; i++) {
      const adjective = adjectives[randomInt(0, adjectives.length - 1)];
      const noun = nouns[randomInt(0, nouns.length - 1)];
      const name = `${adjective} ${noun} - Batch #${i}`;
      const description = `This is a high quality ${name} sourced perfectly for GrocerEase customers.`;
      const price = randomFloat(1.99, 29.99);
      const stock = randomInt(0, 300);

      productsData.push([name, description, price, stock]);
    }

    // Another bulk insert — 1000 products in one query!
    await db.query('INSERT INTO products (name, description, price, stock_quantity) VALUES ?', [productsData]);

    // ====================================================================
    // STEP 4: Create 20 Realistic Orders with Transactions
    // ====================================================================
    // For each order, we:
    //   1. Pick a random customer (IDs 2-10, since ID 1 is the admin)
    //   2. Add 1-5 random products to their cart
    //   3. Look up the actual price from the database (never make up prices)
    //   4. Insert the order, order items, and income transaction
    console.log('Generating 20 detailed orders with transactions...');

    for (let i = 1; i <= 20; i++) {
      const customerId = randomInt(2, 10); // Random customer (not admin)
      let orderTotal = 0;

      // Each order contains 1-5 different products
      const numItemsInOrder = randomInt(1, 5);
      const orderItemsToInsert = [];

      for (let j = 0; j < numItemsInOrder; j++) {
        const productId = randomInt(1, 1000);  // Pick a random product from the 1000 we created
        const quantityToBuy = randomInt(1, 4);  // Buy 1-4 of that product

        // Look up the ACTUAL database price for this product
        // (never hardcode or fabricate prices — always use the source of truth)
        const [productRow] = await db.query('SELECT price FROM products WHERE id = ?', [productId]);
        const priceAtTime = productRow[0].price;

        orderTotal += (priceAtTime * quantityToBuy);
        orderItemsToInsert.push([productId, quantityToBuy, priceAtTime]);
      }

      // Insert the main order record
      const [orderResult] = await db.query(
        'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
        [customerId, orderTotal.toFixed(2), 'completed']
      );
      const newOrderId = orderResult.insertId;

      // Insert the individual order items (the "receipt line items")
      for (const item of orderItemsToInsert) {
        await db.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
          [newOrderId, item[0], item[1], item[2]]
        );
      }

      // Log the income transaction for the dashboard analytics
      await db.query(
        'INSERT INTO transactions (type, amount, description) VALUES (?, ?, ?)',
        ['income', orderTotal.toFixed(2), `Order #${newOrderId} placed by Customer ID ${customerId}`]
      );
    }

    // ====================================================================
    // DONE! Print summary and demo credentials
    // ====================================================================
    console.log('\n✅ Database successfully seeded with realistic data!');
    console.log('-----------------------------------------');
    console.log('Admin Login Email: admin@demo.com');
    console.log('Admin Login Paswd: password123');
    console.log('-----------------------------------------');
    process.exit(0);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// --- Execute the seeding function ---
seedDatabase();
