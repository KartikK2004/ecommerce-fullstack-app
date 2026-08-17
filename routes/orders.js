const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// =====================================================
// POST /api/orders/checkout
// Converts the user's current cart into an order.
// Uses a DATABASE TRANSACTION: if any step fails, everything
// rolls back — we never end up charging for an order that's half-created.
// =====================================================
router.post('/checkout', async (req, res) => {
  const connection = await pool.getConnection(); // grab a dedicated connection for the transaction

  try {
    const { shipping_address } = req.body;

    await connection.beginTransaction(); // start the transaction

    // 1. Get the user's cart items with current product prices
    const [cartItems] = await connection.query(
      `SELECT c.product_id, c.quantity, p.price, p.stock, p.name
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 2. Check stock is still available for every item
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: `Not enough stock for ${item.name}` });
      }
    }

    // 3. Calculate the total order amount
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 4. Create the order record
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address)
       VALUES (?, ?, 'pending', ?)`,
      [req.user.id, totalAmount, shipping_address || null]
    );
    const orderId = orderResult.insertId;

    // 5. Insert one order_items row per cart item, and reduce product stock
    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );

      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // 6. Clear the user's cart now that it's been turned into an order
    await connection.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    // 7. Everything succeeded — commit the transaction (make it permanent)
    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      totalAmount: totalAmount.toFixed(2)
    });
  } catch (err) {
    // If ANYTHING above failed, undo all the changes made in this transaction
    await connection.rollback();
    connection.release();
    console.error('Checkout error:', err.message);
    res.status(500).json({ message: 'Server error during checkout' });
  }
});

// =====================================================
// GET /api/orders
// Get the logged-in user's order history
// =====================================================
router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err.message);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// =====================================================
// GET /api/orders/:id
// Get details of a single order, including its line items
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({ order: orders[0], items });
  } catch (err) {
    console.error('Get order details error:', err.message);
    res.status(500).json({ message: 'Server error fetching order details' });
  }
});

module.exports = router;
