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

  // Cart lines are identified by cart_id, so two sizes of one product stay separate
  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/cart/${cartId}`, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (cartId) => {
    try {
      await api.delete(`/cart/${cartId}`);
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
    return <div className="page-container mt-5 text-center" style={{ color: 'var(--color-muted)' }}>Loading cart...</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="page-container text-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <h3 className="font-display mb-2">Your cart is empty</h3>
        <p style={{ color: 'var(--color-muted)' }}>Add some products to get started!</p>
      </div>
    );
  }

  const unitPrice = (item) =>
    item.discount_percent > 0 ? item.price * (1 - item.discount_percent / 100) : Number(item.price);

  return (
    <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <h2 className="font-display mb-4">Your Cart</h2>

      {message && <div className="alert alert-warning">{message}</div>}

      <div className="row g-4">
        <div className="col-lg-8">
          {cart.items.map((item) => (
            <div
              key={item.cart_id}
              className="d-flex align-items-center gap-3 mb-3 pb-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-accent-soft)', borderRadius: '4px', flexShrink: 0 }} />
              )}

              <div className="flex-grow-1">
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div className="small" style={{ color: 'var(--color-muted)' }}>
                  ₹{unitPrice(item).toFixed(2)} each
                  {item.discount_percent > 0 && <span className="badge bg-danger ms-2">{item.discount_percent}% OFF</span>}
                </div>
                {item.size && (
                  <div className="small" style={{ color: 'var(--color-muted)' }}>Size: {item.size}</div>
                )}

                <div className="d-flex align-items-center gap-2 mt-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}>−</button>
                  <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}>+</button>
                  <button className="btn btn-sm ms-3" style={{ color: '#b0433f' }} onClick={() => removeItem(item.cart_id)}>
                    Remove
                  </button>
                </div>
              </div>

              <div className="price" style={{ fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
                ₹{(unitPrice(item) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="col-lg-4">
          <div className="product-card p-4" style={{ position: 'sticky', top: '1.5rem' }}>
            <h5 className="font-display mb-3">Order Summary</h5>

            <div className="d-flex justify-content-between mb-2 small" style={{ color: 'var(--color-muted)' }}>
              <span>Subtotal</span>
              <span>₹{cart.total}</span>
            </div>
            <div
              className="d-flex justify-content-between mb-3 pb-3"
              style={{ borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: '1.1rem' }}
            >
              <span>Total</span>
              <span>₹{cart.total}</span>
            </div>

            <label className="auth-label">Shipping Address</label>
            <textarea
              className="auth-input mb-3"
              rows="2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address"
            />

            <button className="btn-boutique w-100" onClick={handleCheckout}>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;