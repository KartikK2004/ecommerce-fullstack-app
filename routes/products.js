const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// =====================================================
// GET /api/products
// Public route — anyone can view products.
// Supports optional query params: ?search=, ?category=, ?page=, ?limit=
// Example: /api/products?search=shirt&category=2&page=1&limit=10
// =====================================================
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    // Add search filter if provided (matches product name)
    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    // Add category filter if provided
    if (category) {
      query += ' AND category_id = ?';
      params.push(category);
    }

    // Pagination: page 1 shows first `limit` rows, page 2 shows next `limit`, etc.
    const offset = (page - 1) * limit;
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [products] = await pool.query(query, params);

    res.json({
      page: Number(page),
      limit: Number(limit),
      count: products.length,
      products
    });
  } catch (err) {
    console.error('Get products error:', err.message);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// =====================================================
// GET /api/products/:id
// Public route — get a single product's details
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(products[0]);
  } catch (err) {
    console.error('Get product error:', err.message);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// =====================================================
// POST /api/products
// Admin only — add a new product
// verifyToken checks the JWT is valid; verifyAdmin checks role === 'admin'
// =====================================================
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, stock, image_url, category_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || null, price, stock || 0, image_url || null, category_id || null]
    );

    res.status(201).json({
      message: 'Product created successfully',
      productId: result.insertId
    });
  } catch (err) {
    console.error('Create product error:', err.message);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

// =====================================================
// PUT /api/products/:id
// Admin only — update an existing product
// =====================================================
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category_id } = req.body;

    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, category_id = ?
       WHERE id = ?`,
      [name, description, price, stock, image_url, category_id, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Update product error:', err.message);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// =====================================================
// DELETE /api/products/:id
// Admin only — remove a product
// =====================================================
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM products WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err.message);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

module.exports = router;
