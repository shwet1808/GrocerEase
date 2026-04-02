// ============================================================================
// DATABASE CONFIGURATION — backend/config/db.js
// ============================================================================
//
// WHAT IS THIS FILE?
// ------------------
// This file sets up our connection to the MySQL database and exports a
// ready-to-use database object that the entire application shares.
//
// KEY CONCEPT — CONNECTION POOLS:
// --------------------------------
// Imagine a library with 10 study rooms (connections).
//   - Without a pool: Every student (request) builds a new study room,
//     uses it once, then demolishes it. Very wasteful!
//   - With a pool: 10 study rooms are built once and shared. When a student
//     needs one, they check one out. When they're done, they return it.
//     The next student reuses the same room. Much faster and more efficient!
//
// That's exactly what mysql2.createPool() does — it creates a set of reusable
// database connections that our application shares across all incoming requests.
// ============================================================================

const mysql = require('mysql2');

// ============================================================================
// Create the Connection Pool
// ============================================================================
// We configure the pool with our database credentials from the .env file.
// These values are NEVER hardcoded — they're loaded from environment variables
// so they can differ between local development and production (Railway).
const pool = mysql.createPool({
  host: process.env.DB_HOST,              // Database server address (e.g., "localhost" or a Railway URL)
  port: process.env.DB_PORT || 3306,      // MySQL default port is 3306. Railway may use a different one.
  user: process.env.DB_USER,              // Database username
  password: process.env.DB_PASSWORD,      // Database password
  database: process.env.DB_NAME,          // Which database to use (e.g., "grocerease")
  waitForConnections: true,               // If all connections are in use, wait rather than throwing an error
  connectionLimit: 10,                    // Maximum 10 simultaneous connections (our "study rooms")
  queueLimit: 0                           // No limit on how many requests can wait in the queue (0 = unlimited)
});

// ============================================================================
// Convert to Promise-based API
// ============================================================================
// The default mysql2 library uses "callbacks" (an older pattern).
// pool.promise() gives us a version that supports modern async/await syntax.
//
// Without promises:  db.query('SELECT...', function(err, results) { ... })  ← messy nesting
// With promises:     const [results] = await db.query('SELECT...')           ← clean and readable
const db = pool.promise();

// ============================================================================
// Test the Database Connection on Startup
// ============================================================================
// As soon as this file is imported, we attempt to get a connection from the pool.
// This tells us immediately (in the console) whether the database is reachable.
// If it fails, we log the error so the developer knows to check their .env credentials.
db.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database!');
    connection.release(); // Return the connection to the pool immediately after testing
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err);
  });

// ============================================================================
// Export the Database Object
// ============================================================================
// We export 'db' so other files (services) can import it and run SQL queries.
// Usage in other files:
//   const db = require('../config/db');
//   const [rows] = await db.query('SELECT * FROM products');
module.exports = db;
