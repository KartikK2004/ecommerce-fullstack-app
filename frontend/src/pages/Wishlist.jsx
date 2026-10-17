import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      setItems(response.data);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const addToCart = async (product) => {
    if (product.sizes) {
      navigate(`/product/${product.id}`);
      return;
    }
    try {
      await api.post('/cart', { product_id: product.id, quantity: 1 });
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return <div className="page-container mt-5 text-center" style={{ color: 'var(--color-muted)' }}>Loading your wishlist...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="page-container text-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <h3 className="font-display mb-2">Your wishlist is empty</h3>
        <p style={{ color: 'var(--color-muted)' }}>Save items you love by tapping the heart icon.</p>
        <Link to="/" className="btn-boutique d-inline-block mt-3">Start Browsing</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <h2 className="font-display mb-4">My Wishlist</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <div className="product-grid">
        {items.map((product) => {
          const hasDiscount = product.discount_percent > 0;
          const finalPrice = hasDiscount
            ? (product.price * (1 - product.discount_percent / 100)).toFixed(2)
            : product.price;

          return (
            <div key={product.id} className="product-card h-100">
              <div style={{ position: 'relative' }}>
                <Link to={`/product/${product.id}`}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{ height: '190px', width: '100%', objectFit: 'cover', borderRadius: '4px 4px 0 0' }}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{ height: '190px', backgroundColor: 'var(--color-accent-soft)' }}
                    >
                      <span style={{ color: 'var(--color-muted)' }}>No Image</span>
                    </div>
                  )}
                </Link>
                {hasDiscount && (
                  <span className="badge bg-danger" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    {product.discount_percent}% OFF
                  </span>
                )}
                <button
                  onClick={() => removeItem(product.id)}
                  title="Remove from wishlist"
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: '#fff', border: 'none', borderRadius: '50%',
                    width: '32px', height: '32px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#b0433f" stroke="#b0433f">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                </button>
              </div>

              <div className="card-body d-flex flex-column p-3" style={{ padding: '1.1rem' }}>
                <h6 className="mb-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{product.name}</h6>
                <div className="mb-3">
                  {hasDiscount ? (
                    <>
                      <span className="price">₹{finalPrice}</span>
                      <span className="small ms-2" style={{ color: 'var(--color-muted)', textDecoration: 'line-through' }}>
                        ₹{product.price}
                      </span>
                    </>
                  ) : (
                    <span className="price">₹{product.price}</span>
                  )}
                </div>
                <button className="btn-boutique mt-auto" onClick={() => addToCart(product)}>
                  {product.sizes ? 'Select Size' : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Wishlist;