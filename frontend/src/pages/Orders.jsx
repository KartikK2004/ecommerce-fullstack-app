import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const location = useLocation();
  const newOrderId = location.state?.newOrderId;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);

    if (!orderDetails[orderId]) {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrderDetails((prev) => ({ ...prev, [orderId]: response.data }));
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      }
    }
  };

  const statusColor = {
    pending: 'warning',
    paid: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'danger'
  };

  if (loading) {
    return <div className="page-container mt-5 text-center" style={{ color: 'var(--color-muted)' }}>Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="page-container mt-5 text-center py-5">
        <h4 className="font-display mb-3">No orders yet</h4>
        <p style={{ color: 'var(--color-muted)' }}>When you place an order, it'll show up here.</p>
        <Link to="/" className="btn-boutique d-inline-block mt-2">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="page-container py-4" style={{ maxWidth: '800px' }}>
      <h2 className="font-display mb-4">My Orders</h2>

      {newOrderId && (
        <div className="alert alert-success">Order #{newOrderId} placed successfully! 🎉</div>
      )}

      {orders.map((order) => (
        <div key={order.id} className="product-card mb-3 p-3">
          <div
            className="d-flex justify-content-between align-items-center"
            role="button"
            onClick={() => toggleOrder(order.id)}
          >
            <div>
              <div style={{ fontWeight: 600 }}>Order #{order.id}</div>
              <div className="small" style={{ color: 'var(--color-muted)' }}>
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className={`badge bg-${statusColor[order.status] || 'secondary'} text-capitalize`}>
                {order.status}
              </span>
              <span className="price">₹{order.total_amount}</span>
              <span style={{ color: 'var(--color-muted)' }}>
                {expandedOrderId === order.id ? '▲' : '▼'}
              </span>
            </div>
          </div>

          {expandedOrderId === order.id && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              {!orderDetails[order.id] ? (
                <div className="small" style={{ color: 'var(--color-muted)' }}>Loading details...</div>
              ) : (
                <>
                  {orderDetails[order.id].order.shipping_address && (
                    <p className="small mb-3" style={{ color: 'var(--color-muted)' }}>
                      Shipping to: {orderDetails[order.id].order.shipping_address}
                    </p>
                  )}
                  {orderDetails[order.id].items.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                        <div>
                          <div className="small" style={{ fontWeight: 500 }}>{item.name}</div>
                          <div className="small" style={{ color: 'var(--color-muted)' }}>
                            {item.size ? `Size ${item.size} · ` : ''}Qty: {item.quantity} × ₹{item.price_at_purchase}
                          </div>
                        </div>
                      </div>
                      <div className="small" style={{ fontWeight: 600 }}>
                        ₹{(item.quantity * item.price_at_purchase).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Orders;