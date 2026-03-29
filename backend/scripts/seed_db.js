require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Helper functions for random data
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

const adjectives = ['Organic', 'Fresh', 'Crisp', 'Premium', 'Local', 'Imported', 'Value', 'Artisanal', 'Gluten-Free', 'Vegan'];
const nouns = ['Apples', 'Milk', 'Bread', 'Eggs', 'Chicken', 'Beef', 'Pasta', 'Rice', 'Tomatoes', 'Onions', 'Potatoes', 'Cheese', 'Yogurt', 'Coffee', 'Tea', 'Water', 'Cereal', 'Honey', 'Peanut Butter', 'Olive Oil'];

async function seedDatabase() {
  try {
    console.log("Seeding database... This might take a few seconds.");

    // 1. WIPE OLD DATA
    // We temporarily disable foreign key checks so MySQL lets us completely empty the tables safely
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE order_items');
    await db.query('TRUNCATE TABLE orders');
    await db.query('TRUNCATE TABLE transactions');
    await db.query('TRUNCATE TABLE products');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log("Old data cleared.");

    // 2. CREATE 10 USERS (1 Admin, 9 Customers)
    console.log("Creating 10 users...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // We use a nested array to do a massive "bulk insert" line in SQL
    const usersData = [];
    usersData.push(['Admin User', 'admin@demo.com', hashedPassword, 'admin']); // User ID 1
    
    for (let i = 1; i <= 9; i++) {
      usersData.push([`Customer ${i}`, `customer${i}@demo.com`, hashedPassword, 'customer']); // User IDs 2 - 10
    }
    await db.query('INSERT INTO users (name, email, password, role) VALUES ?', [usersData]);

    // 3. CREATE 1000 PRODUCTS
    console.log("Generating 1000 grocery products...");
    const productsData = [];
    for (let i = 1; i <= 1000; i++) {
      const adjective = adjectives[randomInt(0, adjectives.length - 1)];
      const noun = nouns[randomInt(0, nouns.length - 1)];
      const name = `${adjective} ${noun} - Batch #${i}`;
      const description = `This is a high quality ${name} sourced perfectly for GrocerEase customers.`;
      const price = randomFloat(1.99, 29.99);
      
      // I am completely randomizing stock. Mathematically, a few will hit <10, automatically testing our Dashboard Low Stock feature!
      const stock = randomInt(0, 300); 
      
      productsData.push([name, description, price, stock]);
    }
    await db.query('INSERT INTO products (name, description, price, stock_quantity) VALUES ?', [productsData]);

    // 4. CREATE 20 REALISTIC ORDERS
    console.log("Generating 20 detailed orders with transactions...");
    for (let i = 1; i <= 20; i++) {
      const customerId = randomInt(2, 10); // Randomly pick one of the 9 customers
      let orderTotal = 0;
      
      // Each order will randomly contain between 1 and 5 different products
      const numItemsInOrder = randomInt(1, 5);
      const orderItemsToInsert = [];

      for (let j = 0; j < numItemsInOrder; j++) {
        const productId = randomInt(1, 1000); // Pick a random product off the 1000 product shelf
        const quantityToBuy = randomInt(1, 4);
        
        // Look up the exact price of that specific product
        const [productRow] = await db.query('SELECT price FROM products WHERE id = ?', [productId]);
        const priceAtTime = productRow[0].price;
        
        orderTotal += (priceAtTime * quantityToBuy);
        orderItemsToInsert.push([productId, quantityToBuy, priceAtTime]);
      }

      // Step A: Insert the main order
      const [orderResult] = await db.query(
        'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
        [customerId, orderTotal.toFixed(2), 'completed']
      );
      const newOrderId = orderResult.insertId;

      // Step B: Insert the individual items (the "receipt")
      for (const item of orderItemsToInsert) {
        await db.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
          [newOrderId, item[0], item[1], item[2]] // newOrderId, productId, quantity, price
        );
      }

      // Step C: Log the financial income for the dashboard
      await db.query(
        'INSERT INTO transactions (type, amount, description) VALUES (?, ?, ?)',
        ['income', orderTotal.toFixed(2), `Order #${newOrderId} placed by Customer ID ${customerId}`]
      );
    }

    console.log("\n✅ Database successfully seeded with realistic data!");
    console.log("-----------------------------------------");
    console.log("Admin Login Email: admin@demo.com");
    console.log("Admin Login Paswd: password123");
    console.log("-----------------------------------------");
    process.exit(0);

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
