const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// All wishlist routes require login - a wishlist belongs to a specific user.
router.use(verifyToken);

// =====================================================
// GET /api/wishlist
// Get the logged-in user's saved products, with full product details
// =====================================================
router.get('/', async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT w.id AS wishlist_id, p.*
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    res.json(items);
  } catch (err) {
    console.error('Get wishlist error:', err.message);
    res.status(500).json({ message: 'Server error fetching wishlist' });
  }
});

// =====================================================
// POST /api/wishlist
// Add a product to the wishlist
// =====================================================
router.post('/', async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required' });
    }

    // INSERT IGNORE - if it's already in the wishlist (UNIQUE constraint), just do nothing
    // instead of throwing an error, since "adding" something already saved isn't really an error.
    await pool.query(
      'INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [req.user.id, product_id]
    );

    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    console.error('Add to wishlist error:', err.message);
    res.status(500).json({ message: 'Server error adding to wishlist' });
  }
});

// =====================================================
// DELETE /api/wishlist/:productId
// Remove a product from the wishlist
// =====================================================
router.delete('/:productId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.id, req.params.productId]
    );
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error('Remove from wishlist error:', err.message);
    res.status(500).json({ message: 'Server error removing from wishlist' });
  }
});

module.exports = router;