// ============================================================================
// SERVER.JS — The Entry Point of the GrocerEase Backend
// ============================================================================
//
// WHAT IS THIS FILE?
// ------------------
// This is the very first file that runs when you start the backend server.
// Think of it as the "main door" of your application. It does 3 things:
//
//   1. CREATES the Express app (our web server framework)
//   2. REGISTERS all the middleware (plugins that process every request)
//   3. MOUNTS all the route files (connects URL paths to the right code)
//   4. STARTS listening for incoming HTTP requests on a specific port
//
// HOW TO RUN:
//   Development:  npm run dev    (uses nodemon for auto-restart on file changes)
//   Production:   npm start      (runs with plain Node.js)
//
// WHAT IS EXPRESS?
// Express is a lightweight framework that makes it easy to build web servers
// in Node.js. Without it, you'd have to manually parse HTTP requests,
// handle routing, manage headers, etc. Express does all of that for you.
// ============================================================================

// --- Load Environment Variables ---
// dotenv reads the .env file and makes its contents available as process.env.VARIABLE_NAME
// This must be called BEFORE any code that uses environment variables (like db.js)
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// ============================================================================
// STEP 1: Create the Express Application
// ============================================================================
// This creates an instance of an Express application.
// The 'app' object has methods for routing HTTP requests, configuring
// middleware, and starting the server.
const app = express();

// ============================================================================
// STEP 2: Register Global Middleware
// ============================================================================
// Middleware functions run on EVERY incoming request, in the order they're registered.
// Think of them as a series of checkpoints that every request must pass through.

// CORS (Cross-Origin Resource Sharing):
// By default, browsers block requests from one domain (our frontend on localhost:3000)
// to another domain (our backend on localhost:5000). CORS middleware tells the browser
// "it's okay, I trust requests from that frontend domain."
app.use(cors());

// JSON Body Parser:
// When the frontend sends data (like a login form), it arrives as raw text in JSON format.
// This middleware automatically converts that JSON text into a JavaScript object
// that we can access via req.body in our route handlers.
app.use(express.json());

// ============================================================================
// STEP 3: Health Check Route
// ============================================================================
// A simple test endpoint to verify the server is running.
// Visit http://localhost:5000/ in your browser to see the message.
// This is also useful for deployment platforms (like Render) that
// ping the server to check if it's alive.
app.get('/', (req, res) => {
  res.send('Grocery Store API is running...');
});

// ============================================================================
// STEP 4: Import and Mount Route Modules
// ============================================================================
// Each route module handles a specific "resource" (auth, products, orders, etc.).
// app.use('/api/auth', authRoutes) means:
//   "Any request starting with /api/auth should be handled by the authRoutes file."
//
// Inside authRoutes.js, a route like router.post('/login') becomes:
//   POST /api/auth/login (the prefix + the route path combined)
//
// This keeps our routes organized — each feature in its own file.

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);          // Signup & Login
app.use('/api/products', productRoutes);    // Product CRUD operations
app.use('/api/orders', orderRoutes);        // Order placement & history
app.use('/api/dashboard', dashboardRoutes); // Admin analytics dashboard
app.use('/api/users', userRoutes);          // Admin user/customer management

// ============================================================================
// STEP 5: Initialize Database Connection
// ============================================================================
// Importing db.js triggers the database connection pool to start.
// The pool automatically connects to MySQL and logs success/failure.
// We don't need to use the returned 'db' object here — it's used by the services.
const db = require('./config/db');

// ============================================================================
// STEP 6: Start the Server
// ============================================================================
// app.listen() tells Node.js to start accepting HTTP connections on the given port.
// The callback function runs once the server is ready and listening.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
