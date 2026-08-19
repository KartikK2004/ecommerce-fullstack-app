const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// =====================================================
// GET /api/categories
// Public — returns all categories, used to build the filter pills
// =====================================================
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err.message);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

module.exports = router;
