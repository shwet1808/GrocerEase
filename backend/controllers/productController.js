// ============================================================================
// PRODUCT CONTROLLER — backend/controllers/productController.js
// ============================================================================
//
// This controller handles all HTTP requests related to grocery products.
// It acts as a thin bridge between the Express routes and the product service.
//
// Each function follows the same simple pattern:
//   1. Read data from the request (req.params, req.body)
//   2. Call the product service function
//   3. Send the response back to the client
//   4. Catch and handle any errors
// ============================================================================

const productService = require('../services/productService');

// ============================================================================
// 1. GET ALL PRODUCTS (Public — no authentication needed)
// GET /api/products
// ============================================================================
// Returns a list of every product in the store.
// Anyone can view products, even without logging in.
//
// Success response (200 OK):
//   [{ id: 1, name: "Organic Apples", price: 4.99, stock_quantity: 50, ... }, ...]
// ============================================================================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.fetchAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};


// ============================================================================
// 2. GET SINGLE PRODUCT (Public — no authentication needed)
// GET /api/products/:id
// ============================================================================
// Returns details for one specific product.
// The ":id" in the URL is a route parameter (e.g., /api/products/5 → id = 5).
//
// Success response (200 OK):
//   { id: 5, name: "Fresh Milk", price: 3.49, stock_quantity: 100, ... }
//
// Error response (404 Not Found):
//   { message: "Product not found" }
// ============================================================================
exports.getProductById = async (req, res) => {
  try {
    const product = await productService.fetchProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Server error while fetching product'
    });
  }
};


// ============================================================================
// 3. CREATE PRODUCT (Admin Only)
// POST /api/products
// ============================================================================
// Creates a new product in the store's catalog.
// Only admins can access this (enforced by middleware in the route file).
//
// Expected request body:
//   { "name": "Organic Apples", "description": "Fresh from the farm", "price": 4.99, "stock_quantity": 50 }
//
// Success response (201 Created):
//   { "message": "Product created successfully", "productId": 42 }
// ============================================================================
exports.createProduct = async (req, res) => {
  try {
    const result = await productService.createProduct(req.body);
    res.status(201).json({
      message: 'Product created successfully',
      productId: result.productId
    });
  } catch (error) {
    console.error('Error creating product:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Server error while creating product'
    });
  }
};


// ============================================================================
// 4. UPDATE PRODUCT (Admin Only)
// PUT /api/products/:id
// ============================================================================
// Updates an existing product's details.
// Only the fields provided in the request body will be changed.
//
// Expected request body (all fields optional):
//   { "name": "Updated Name", "price": 5.99 }
//
// Success response (200 OK):
//   { "message": "Product updated successfully" }
// ============================================================================
exports.updateProduct = async (req, res) => {
  try {
    const result = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating product:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Server error while updating product'
    });
  }
};


// ============================================================================
// 5. DELETE PRODUCT (Admin Only)
// DELETE /api/products/:id
// ============================================================================
// Removes a product from the store's catalog.
// Will fail if the product is already part of an existing order
// (the database protects order history with a foreign key constraint).
//
// Success response (200 OK):
//   { "message": "Product deleted successfully" }
//
// Error response (400 Bad Request):
//   { "message": "Cannot delete... product is tied to an existing order" }
// ============================================================================
exports.deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting product:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || 'Server error while deleting product'
    });
  }
};
