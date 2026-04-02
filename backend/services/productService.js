// ============================================================================
// PRODUCT SERVICE — backend/services/productService.js
// ============================================================================
//
// This service handles all business logic related to grocery products:
//   - Fetching products (all or by ID)
//   - Creating new products
//   - Updating existing products
//   - Deleting products (with foreign key constraint handling)
//
// The controller calls these functions and passes in the necessary data.
// These functions talk to the database and return results (or throw errors).
// ============================================================================

const db = require('../config/db');

// ============================================================================
// FETCH ALL PRODUCTS
// ============================================================================
// Retrieves every product from the database, sorted by newest first.
//
// Returns: Array of product objects
//   Example: [{ id: 1, name: "Organic Apples", price: 4.99, ... }, ...]
// ============================================================================
const fetchAllProducts = async () => {
  // ORDER BY created_at DESC = show the newest products first
  const [products] = await db.query(
    'SELECT * FROM products ORDER BY created_at DESC'
  );
  return products;
};


// ============================================================================
// FETCH SINGLE PRODUCT BY ID
// ============================================================================
// Retrieves one specific product using its unique ID number.
//
// Parameters:
//   - id (number): The product's unique identifier (from the URL, e.g. /api/products/5)
//
// Returns: A single product object
// Throws:  Error with statusCode 404 if the product doesn't exist
// ============================================================================
const fetchProductById = async (id) => {
  const [products] = await db.query(
    'SELECT * FROM products WHERE id = ?',
    [id]
  );

  // If the array is empty, no product was found with that ID
  if (products.length === 0) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // Return just the first element (there can only be one since ID is unique)
  return products[0];
};


// ============================================================================
// CREATE A NEW PRODUCT
// ============================================================================
// Inserts a new product into the database.
//
// Parameters:
//   - data (object): { name, description, price, stock_quantity }
//     - name           (string):  Required. The product name, e.g. "Organic Milk"
//     - description    (string):  Optional. A short description of the product
//     - price          (number):  Required. The price in dollars, e.g. 3.99
//     - stock_quantity (number):  Required. How many units are available on the shelf
//
// Returns: { productId: <number> }
// Throws:  Error with statusCode 400 if required fields are missing
// ============================================================================
const createProduct = async (data) => {
  const { name, description, price, stock_quantity } = data;

  // --- Validation: Ensure required fields are provided ---
  if (!name || !price || stock_quantity === undefined) {
    const error = new Error('Name, price, and stock quantity are required.');
    error.statusCode = 400;
    throw error;
  }

  const [result] = await db.query(
    'INSERT INTO products (name, description, price, stock_quantity) VALUES (?, ?, ?, ?)',
    [name, description, price, stock_quantity]
  );

  return { productId: result.insertId };
};


// ============================================================================
// UPDATE AN EXISTING PRODUCT
// ============================================================================
// Modifies a product's details. If a field is not provided in the update,
// we keep the original value (a "partial update" or "patch" pattern).
//
// Parameters:
//   - id   (number): The product's unique identifier
//   - data (object): { name, description, price, stock_quantity } — all optional
//
// Returns: { message: "Product updated successfully" }
// Throws:  Error with statusCode 404 if the product doesn't exist
// ============================================================================
const updateProduct = async (id, data) => {
  const { name, description, price, stock_quantity } = data;

  // --- Step 1: Check if the product exists ---
  const [existing] = await db.query(
    'SELECT * FROM products WHERE id = ?',
    [id]
  );

  if (existing.length === 0) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // --- Step 2: Merge new values with existing values ---
  // This is a "fallback" pattern: use the new value if provided,
  // otherwise keep the old value from the database.
  // For stock_quantity, we use a special check because 0 is a valid value
  // but would be falsy in a simple `||` check.
  const currentProduct = existing[0];

  await db.query(
    'UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ? WHERE id = ?',
    [
      name || currentProduct.name,
      description || currentProduct.description,
      price || currentProduct.price,
      stock_quantity !== undefined ? stock_quantity : currentProduct.stock_quantity,
      id
    ]
  );

  return { message: 'Product updated successfully' };
};


// ============================================================================
// DELETE A PRODUCT
// ============================================================================
// Removes a product from the database entirely.
//
// IMPORTANT GOTCHA — Foreign Key Constraints:
//   If a customer has already ordered this product, the database has a rule
//   (ON DELETE RESTRICT) that PREVENTS deletion to protect order history.
//   We catch this specific error and return a user-friendly message.
//
// Parameters:
//   - id (number): The product's unique identifier
//
// Returns: { message: "Product deleted successfully" }
// Throws:  Error with statusCode 404 if product not found
//          Error with statusCode 400 if product is tied to existing orders
// ============================================================================
const deleteProduct = async (id) => {
  // --- Step 1: Check if the product exists ---
  const [existing] = await db.query(
    'SELECT * FROM products WHERE id = ?',
    [id]
  );

  if (existing.length === 0) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // --- Step 2: Attempt to delete ---
  try {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return { message: 'Product deleted successfully' };
  } catch (dbError) {
    // --- Handle Foreign Key Constraint Error ---
    // MySQL error code 'ER_ROW_IS_REFERENCED_2' means another table (order_items)
    // still references this product. We can't delete it without breaking order history.
    if (dbError.code === 'ER_ROW_IS_REFERENCED_2') {
      const error = new Error(
        'Cannot delete this product because it is tied to an existing customer order. ' +
        'Try setting stock to 0 instead.'
      );
      error.statusCode = 400;
      throw error;
    }
    // Re-throw any other unexpected database errors
    throw dbError;
  }
};


// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  fetchAllProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
