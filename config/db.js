const mysql = require('mysql2/promise');
require('dotenv').config();

// A connection pool reuses connections instead of opening a new one per request.
// Cloud databases (like TiDB Cloud) need a custom port and an encrypted (SSL) connection,
// so both are controlled by environment variables. Locally, the defaults still work.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true'
    ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;