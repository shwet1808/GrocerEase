const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize the express app
const app = express();

// Middleware
app.use(cors()); // Allow requests from our frontend
app.use(express.json()); // Allow our app to read JSON data from requests

// A simple test route to ensure the server is running
app.get('/', (req, res) => {
  res.send('Grocery Store API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Import and connect database
const db = require('./config/db');

// Define the port (use the one from .env or default to 5000)
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
