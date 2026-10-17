const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({
      status: 'ok',
      message: 'Server is running and connected to MySQL',
      dbTest: rows[0].result
    });
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Server is running but could not connect to MySQL',
      error: err.message
    });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/wishlist', require('./routes/wishlist'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});