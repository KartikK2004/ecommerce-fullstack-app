const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// All cart routes require login — a cart always belongs to a specific user.
// verifyToken runs on every route below via router.use()
router.use(verifyToken);

// =====================================================
// GET /api/cart
// Get the logged-in user's cart, joined with product details
// (so we can show name, price, image — not just IDs)
// =====================================================
router.get('/', async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT c.id AS cart_id, c.quantity, 
              p.id AS product_id, p.name, p.price, p.image_url, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    // Calculate the total price of everything in the cart
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ items, total: total.toFixed(2) });
  } catch (err) {
    console.error('Get cart error:', err.message);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
});

// =====================================================
// POST /api/cart
// Add a product to the cart (or increase quantity if it's already there)
// =====================================================
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required' });
    }

    // Check the product actually exists and has enough stock
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (products[0].stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    // "ON DUPLICATE KEY UPDATE" uses the UNIQUE(user_id, product_id) constraint
    // from our schema — if the row already exists, it increases quantity
    // instead of creating a duplicate row.
    await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [req.user.id, product_id, quantity, quantity]
    );

    res.status(201).json({ message: 'Item added to cart' });
  } catch (err) {
    console.error('Add to cart error:', err.message);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
});

// =====================================================
// PUT /api/cart/:productId
// Update the quantity of a specific item in the cart
// =====================================================
router.put('/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const [result] = await pool.query(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, req.user.id, req.params.productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({ message: 'Cart updated' });
  } catch (err) {
    console.error('Update cart error:', err.message);
    res.status(500).json({ message: 'Server error updating cart' });
  }
});

// =====================================================
// DELETE /api/cart/:productId
// Remove a single item from the cart
// =====================================================
router.delete('/:productId', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, req.params.productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove from cart error:', err.message);
    res.status(500).json({ message: 'Server error removing item' });
  }
});

module.exports = router;
