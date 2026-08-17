const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app = express();

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// ---- Health check route ----
// Hit this first to confirm the server AND the MySQL connection both work.
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({
      status: 'ok',
      message: 'Server is running and connected to MySQL',
      dbTest: rows[0].result // should be 2
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

// ---- Routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
