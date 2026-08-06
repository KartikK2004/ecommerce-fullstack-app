const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// =====================================================
// POST /api/auth/register
// Creates a new user account
// =====================================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // 2. Check if a user with this email already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    // 3. Hash the password before storing it
    //    NEVER store plain-text passwords in the database.
    //    bcrypt.hash scrambles the password + adds "salt" (random noise) so
    //    even two users with the same password get different hashes.
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Insert the new user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'customer']
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// =====================================================
// POST /api/auth/login
// Verifies credentials and returns a JWT token
// =====================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 1. Find the user by email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (users.length === 0) {
      // Deliberately vague message — don't reveal whether the email exists,
      // this makes it harder for attackers to guess valid accounts.
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = users[0];

    // 2. Compare the submitted password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. Create a JWT token — this acts like a signed, tamper-proof ID card
    //    the frontend will attach to future requests to prove who they are.
    const token = jwt.sign(
      { id: user.id, role: user.role },   // data stored inside the token
      process.env.JWT_SECRET,              // secret key used to sign it
      { expiresIn: '7d' }                  // token expires in 7 days
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
