const db = require('../config/db');

// ==========================================
// 1. GET ALL PRODUCTS (Public)
// GET /api/products
// ==========================================
exports.getAllProducts = async (req, res) => {
  try {
    // A simple SELECT query to fetch everything from the products table
    const [products] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};

// ==========================================
// 2. GET SINGLE PRODUCT (Public)
// GET /api/products/:id
// ==========================================
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id; // Get the ID from the URL
    
    // We use ? to prevent SQL injection
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(200).json(products[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error while fetching product" });
  }
};

// ==========================================
// 3. CREATE PRODUCT (Admin Only)
// POST /api/products
// ==========================================
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock_quantity } = req.body;

    // Basic Validation
    if (!name || !price || stock_quantity === undefined) {
      return res.status(400).json({ message: "Name, price, and stock quantity are required." });
    }

    const [result] = await db.query(
      'INSERT INTO products (name, description, price, stock_quantity) VALUES (?, ?, ?, ?)',
      [name, description, price, stock_quantity]
    );

    res.status(201).json({
      message: "Product created successfully",
      productId: result.insertId
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error while creating product" });
  }
};

// ==========================================
// 4. UPDATE PRODUCT (Admin Only)
// PUT /api/products/:id
// ==========================================
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, stock_quantity } = req.body;

    // Check if product exists first
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update using COALESCE or just passing the new values. 
    // For simplicity, we assume the frontend sends all current values if they didn't change them.
    await db.query(
      'UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ? WHERE id = ?',
      [
        name || existing[0].name, 
        description || existing[0].description, 
        price || existing[0].price, 
        stock_quantity !== undefined ? stock_quantity : existing[0].stock_quantity, 
        productId
      ]
    );

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error while updating product" });
  }
};

// ==========================================
// 5. DELETE PRODUCT (Admin Only)
// DELETE /api/products/:id
// ==========================================
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if product exists
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Try to delete it
    // Note: Due to our ON DELETE RESTRICT in the order_items table, 
    // this will completely crash (throw an error) if a user has already ordered this product!
    await db.query('DELETE FROM products WHERE id = ?', [productId]);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    // If the error is regarding a foreign key constraint, we can gracefully tell the user.
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        message: "Cannot delete this product because it is tied to an existing customer order. Try setting stock to 0 instead." 
      });
    }
    res.status(500).json({ message: "Server error while deleting product" });
  }
};
