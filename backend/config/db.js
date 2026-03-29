const mysql = require('mysql2');

// We use mysql2.createPool instead of createConnection
// A connection pool is better for performance because it reuses database connections
// instead of opening and closing a new connection for every single query.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306, // Added to support Railway cloud databases!
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert the pool to use promises so we can use modern async/await syntax 
// rather than old callback functions.
const db = pool.promise();

// Test the connection immediately to see if it works
db.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database!');
    connection.release(); // release the connection back to the pool
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err);
  });

module.exports = db;
