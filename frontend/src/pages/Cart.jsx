import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Cart() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return; // don't allow going below 1 here — use remove instead
    try {
      await api.put(`/cart/${productId}`, { quantity: newQuantity });
      fetchCart(); // refresh the cart to show updated totals
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      fetchCart();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      setMessage('Please enter a shipping address');
      return;
    }
    try {
      const response = await api.post('/orders/checkout', { shipping_address: address });
      navigate('/orders', { state: { newOrderId: response.data.orderId } });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Checkout failed');
    }
  };

  if (loading) {
    return <div className="container mt-5 text-center">Loading cart...</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h3>Your cart is empty</h3>
        <p className="text-muted">Add some products to get started!</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Your Cart</h2>

      {message && <div className="alert alert-warning">{message}</div>}

      <table className="table align-middle">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((item) => (
            <tr key={item.product_id}>
              <td>{item.name}</td>
              <td>₹{item.price}</td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </td>
              <td>₹{(item.price * item.quantity).toFixed(2)}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeItem(item.product_id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="row justify-content-end">
        <div className="col-md-4">
          <div className="card p-3">
            <h5>Total: ₹{cart.total}</h5>

            <div className="mb-3 mt-2">
              <label className="form-label">Shipping Address</label>
              <textarea
                className="form-control"
                rows="2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full address"
              />
            </div>

            <button className="btn btn-success" onClick={handleCheckout}>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
