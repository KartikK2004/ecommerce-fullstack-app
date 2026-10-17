const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// POST /api/orders/checkout
// Runs as ONE transaction: if any step fails, everything rolls back.
router.post('/checkout', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { shipping_address } = req.body;

    await connection.beginTransaction();

    const [cartItems] = await connection.query(
      `SELECT c.product_id, c.quantity, c.size,
              p.price, p.discount_percent, p.stock, p.name
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

    // Stock check uses the TOTAL quantity per product (same product can be in several sizes)
    const totals = {};
    for (const item of cartItems) {
      totals[item.product_id] = (totals[item.product_id] || 0) + item.quantity;
    }
    for (const item of cartItems) {
      if (item.stock < totals[item.product_id]) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: `Not enough stock for ${item.name}` });
      }
    }

    // Price actually charged = sale price if the product is discounted
    const priced = cartItems.map((item) => ({
      ...item,
      finalPrice: item.discount_percent
        ? Number((item.price * (1 - item.discount_percent / 100)).toFixed(2))
        : Number(item.price)
    }));
    const totalAmount = priced.reduce((sum, i) => sum + i.finalPrice * i.quantity, 0);

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address)
       VALUES (?, ?, 'pending', ?)`,
      [req.user.id, totalAmount, shipping_address || null]
    );
    const orderId = orderResult.insertId;

    for (const item of priced) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, size)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.finalPrice, item.size]
      );
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      totalAmount: totalAmount.toFixed(2)
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Checkout error:', err.message);
    res.status(500).json({ message: 'Server error during checkout' });
  }
});

// PUT /api/orders/:id/cancel
// A customer can cancel their OWN order, but only while it is still 'pending'.
// Runs in a transaction: stock is returned and the status is changed together.
router.put('/:id/cancel', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // FOR UPDATE locks this order row, so a double-click or two tabs
    // can't cancel it twice and return the stock twice.
    const [orders] = await connection.query(
      'SELECT id, status FROM orders WHERE id = ? AND user_id = ? FOR UPDATE',
      [req.params.id, req.user.id]
    );

    if (orders.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orders[0].status !== 'pending') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        message: `This order is already ${orders[0].status} and can no longer be cancelled`
      });
    }

    // Put the items back into stock
    const [items] = await connection.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [req.params.id]
    );
    for (const item of items) {
      await connection.query(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.query(
      "UPDATE orders SET status = 'cancelled' WHERE id = ?",
      [req.params.id]
    );

    await connection.commit();
    connection.release();

    res.json({ message: 'Order cancelled', status: 'cancelled' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('Cancel order error:', err.message);
    res.status(500).json({ message: 'Server error cancelling order' });
  }
});

// GET /api/orders
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

// GET /api/orders/:id
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