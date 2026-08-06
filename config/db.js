const mysql = require('mysql2/promise');
require('dotenv').config();

// A connection pool is better than a single connection —
// it reuses connections instead of opening a new one per request.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
