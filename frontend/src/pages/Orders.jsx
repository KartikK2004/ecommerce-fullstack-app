import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';

const STEPS = ['pending', 'paid', 'shipped', 'delivered'];

const STATUS_STYLE = {
  pending: { bg: '#FBF3E0', color: '#9A6700' },
  paid: { bg: '#E6F0FA', color: '#2B6CB0' },
  shipped: { bg: '#E8ECE6', color: '#2F4538' },
  delivered: { bg: '#E3F4EA', color: '#276749' },
  cancelled: { bg: '#FBEAE9', color: '#B0433F' }
};

function StatusPill({ status }) {
  const s = STATUS_STYLE[status] || { bg: '#eee', color: '#555' };
  return (
    <span
      style={{
        background: s.bg, color: s.color, padding: '0.3rem 0.8rem',
        borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
        letterSpacing: '0.03em', textTransform: 'capitalize'
      }}
    >
      {status}
    </span>
  );
}

// Shows progress: pending -> paid -> shipped -> delivered
function Tracker({ status }) {
  const current = STEPS.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '0.5rem 0.25rem' }}>
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <div
            key={step}
            style={{ display: 'flex', alignItems: 'flex-start', flex: i < STEPS.length - 1 ? 1 : 'none' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: done ? 'var(--color-accent)' : '#fff',
                  border: `2px solid ${done ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {done && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                )}
              </div>
              <span
                style={{
                  fontSize: '0.7rem', textTransform: 'capitalize',
                  color: done ? 'var(--color-ink)' : 'var(--color-muted)',
                  fontWeight: done ? 600 : 400
                }}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1, height: '2px', margin: '8px 8px 0',
                  background: i < current ? 'var(--color-accent)' : 'var(--color-border)'
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [cancellingId, setCancellingId] = useState(null);
  const [notice, setNotice] = useState('');
  const location = useLocation();
  const newOrderId = location.state?.newOrderId;

  useEffect(() => {
    fetchOrders();
  }, []);

  const loadDetails = async (orderId) => {
    if (orderDetails[orderId]) return;
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrderDetails((prev) => ({ ...prev, [orderId]: response.data }));
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
      // Open the order that was just placed so the customer sees it straight away
      if (newOrderId) {
        setExpandedOrderId(newOrderId);
        loadDetails(newOrderId);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    loadDetails(orderId);
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    setCancellingId(orderId);
    try {
      await api.put(`/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)));
      setNotice(`Order #${orderId} has been cancelled.`);
    } catch (err) {
      setNotice(err.response?.data?.message || 'Could not cancel the order');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container text-center" style={{ paddingTop: '4rem', color: 'var(--color-muted)' }}>
        Loading your orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page-container text-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <h3 className="font-display mb-2">No orders yet</h3>
        <p style={{ color: 'var(--color-muted)' }}>When you place an order, it will show up here.</p>
        <Link to="/" className="btn-boutique mt-2">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        <div className="eyebrow mb-2">Your account</div>
        <div className="d-flex justify-content-between align-items-end mb-4">
          <h2 className="font-display mb-0">My Orders</h2>
          <span className="small" style={{ color: 'var(--color-muted)' }}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        {newOrderId && (
          <div
            className="d-flex align-items-center gap-2 mb-4"
            style={{
              background: 'var(--color-accent-soft)', border: '1px solid var(--color-border)',
              borderRadius: '6px', padding: '0.9rem 1.1rem', color: 'var(--color-accent)', fontWeight: 500
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-6" />
            </svg>
            Order #{newOrderId} placed successfully. Thank you for shopping with us!
          </div>
        )}

        {notice && (
          <div className="alert alert-info d-flex justify-content-between align-items-center">
            <span>{notice}</span>
            <span role="button" onClick={() => setNotice('')} style={{ cursor: 'pointer' }}>✕</span>
          </div>
        )}

        {orders.map((order) => {
          const isOpen = expandedOrderId === order.id;
          const details = orderDetails[order.id];

          return (
            <div
              key={order.id}
              style={{
                background: '#fff', border: '1px solid var(--color-border)',
                borderRadius: '6px', marginBottom: '1.1rem', overflow: 'hidden'
              }}
            >
              {/* Header row - click to expand */}
              <div
                role="button"
                onClick={() => toggleOrder(order.id)}
                className="d-flex flex-wrap justify-content-between align-items-center gap-3"
                style={{ padding: '1.2rem 1.5rem', cursor: 'pointer' }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.02rem' }}>Order #{order.id}</div>
                  <div className="small" style={{ color: 'var(--color-muted)' }}>
                    Placed on{' '}
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-4">
                  <StatusPill status={order.status} />
                  <span className="price" style={{ fontSize: '1.2rem' }}>₹{order.total_amount}</span>
                  <svg
                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="var(--color-muted)" strokeWidth="2"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Progress tracker (hidden for cancelled orders) */}
              {order.status !== 'cancelled' && (
                <div style={{ padding: '0 1.5rem 1.2rem' }}>
                  <Tracker status={order.status} />
                </div>
              )}

              {/* Expanded details */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)', padding: '1.25rem 1.5rem' }}>
                  {!details ? (
                    <div className="small" style={{ color: 'var(--color-muted)' }}>Loading details...</div>
                  ) : (
                    <>
                      {details.order.shipping_address && (
                        <div className="mb-3">
                          <div className="eyebrow mb-1" style={{ fontSize: '0.65rem' }}>Shipping to</div>
                          <div className="small">{details.order.shipping_address}</div>
                        </div>
                      )}

                      {details.items.map((item) => (
                        <div
                          key={item.id}
                          className="d-flex align-items-center gap-3 py-3"
                          style={{ borderTop: '1px solid var(--color-border)' }}
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: '64px', height: '64px', borderRadius: '4px', background: 'var(--color-accent-soft)', flexShrink: 0 }} />
                          )}

                          <div className="flex-grow-1">
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            <div className="small d-flex align-items-center gap-2" style={{ color: 'var(--color-muted)' }}>
                              {item.size && (
                                <span
                                  style={{
                                    border: '1px solid var(--color-border)', borderRadius: '3px',
                                    padding: '0 0.4rem', background: '#fff', color: 'var(--color-ink)'
                                  }}
                                >
                                  Size {item.size}
                                </span>
                              )}
                              <span>Qty {item.quantity} × ₹{Number(item.price_at_purchase).toFixed(2)}</span>
                            </div>
                          </div>

                          <div style={{ fontWeight: 600 }}>
                            ₹{(item.quantity * item.price_at_purchase).toFixed(2)}
                          </div>
                        </div>
                      ))}

                      <div
                        className="d-flex justify-content-between pt-3"
                        style={{ borderTop: '1px solid var(--color-border)', fontWeight: 700 }}
                      >
                        <span>Order total</span>
                        <span>₹{order.total_amount}</span>
                      </div>

                      <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                        {order.status === 'pending' ? (
                          <>
                            <span className="small" style={{ color: 'var(--color-muted)' }}>
                              Changed your mind? You can cancel until the order is paid.
                            </span>
                            <button
                              className="btn btn-sm"
                              disabled={cancellingId === order.id}
                              onClick={() => cancelOrder(order.id)}
                              style={{
                                border: '1px solid #B0433F', color: '#B0433F', background: '#fff',
                                borderRadius: '2px', padding: '0.45rem 1.1rem'
                              }}
                            >
                              {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                          </>
                        ) : order.status === 'cancelled' ? (
                          <span className="small" style={{ color: '#B0433F' }}>This order was cancelled.</span>
                        ) : (
                          <span className="small" style={{ color: 'var(--color-muted)' }}>
                            This order has already been processed and can no longer be cancelled.
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Orders;