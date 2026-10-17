const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// =====================================================
// GET /api/cart
// =====================================================
router.get('/', async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT c.id AS cart_id, c.quantity, c.size,
              p.id AS product_id, p.name, p.price, p.image_url, p.stock, p.discount_percent
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    // Use the discounted price for the total if the product is on sale
    const total = items.reduce((sum, item) => {
      const effectivePrice = item.discount_percent
        ? item.price * (1 - item.discount_percent / 100)
        : item.price;
      return sum + effectivePrice * item.quantity;
    }, 0);

    res.json({ items, total: total.toFixed(2) });
  } catch (err) {
    console.error('Get cart error:', err.message);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
});

// =====================================================
// POST /api/cart
// Add a product to the cart, optionally with a size.
// A product+size combo is treated as a distinct cart line
// (e.g. same t-shirt in size M and size L are two separate rows).
// =====================================================
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity = 1, size = null } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required' });
    }

    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (products[0].stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    // If the product requires a size (has sizes defined) but none was picked, reject it
    if (products[0].sizes && !size) {
      return res.status(400).json({ message: 'Please select a size' });
    }

    // Check if this exact product+size is already in the cart
    const [existing] = await pool.query(
      'SELECT id FROM cart WHERE user_id = ? AND product_id = ? AND (size = ? OR (size IS NULL AND ? IS NULL))',
      [req.user.id, product_id, size, size]
    );

    if (existing.length > 0) {
      await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
    } else {
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)',
        [req.user.id, product_id, quantity, size]
      );
    }

    res.status(201).json({ message: 'Item added to cart' });
  } catch (err) {
    console.error('Add to cart error:', err.message);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
});

// =====================================================
// PUT /api/cart/:productId
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