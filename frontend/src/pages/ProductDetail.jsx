import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    setQuantity(1);
    setSelectedSize('');
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (user) checkWishlist();
  }, [id, user]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      console.error('Failed to fetch product:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      setIsSaved(response.data.some((p) => p.id === Number(id)));
    } catch (err) {
      console.error('Failed to check wishlist:', err);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      setMessage('Please login to save items');
      return;
    }
    try {
      if (isSaved) await api.delete(`/wishlist/${id}`);
      else await api.post('/wishlist', { product_id: Number(id) });
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Wishlist toggle failed:', err);
    }
  };

  const sizeOptions = product?.sizes ? product.sizes.split(',') : [];

  const addItem = async () => {
    if (!user) {
      setMessage('Please login to continue');
      return false;
    }
    if (sizeOptions.length > 0 && !selectedSize) {
      setMessage('Please select a size');
      return false;
    }
    try {
      await api.post('/cart', { product_id: product.id, quantity, size: selectedSize || null });
      return true;
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  const addToCart = async () => {
    if (await addItem()) {
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const buyNow = async () => {
    if (await addItem()) navigate('/cart');
  };

  if (loading) {
    return <div className="page-container mt-5 text-center" style={{ color: 'var(--color-muted)' }}>Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="page-container mt-5 text-center py-5">
        <h4 className="font-display">Product not found</h4>
        <Link to="/" className="btn-boutique d-inline-block mt-3">Back to Shop</Link>
      </div>
    );
  }

  const outOfStock = product.stock === 0;
  const hasDiscount = product.discount_percent > 0;
  const finalPrice = hasDiscount
    ? (product.price * (1 - product.discount_percent / 100)).toFixed(2)
    : product.price;

  return (
    <div className="page-container py-4">
      <Link to="/" className="small mb-4 d-inline-block" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>
        ← Back to Shop
      </Link>

      <div className="row g-5">
        <div className="col-md-6">
          <div style={{ position: 'relative' }}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-100"
                style={{ borderRadius: '6px', objectFit: 'cover', maxHeight: '480px' }}
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center w-100"
                style={{ height: '480px', backgroundColor: 'var(--color-accent-soft)', borderRadius: '6px' }}
              >
                <span style={{ color: 'var(--color-muted)' }}>No Image</span>
              </div>
            )}
            {hasDiscount && (
              <span className="badge bg-danger" style={{ position: 'absolute', top: '14px', left: '14px', fontSize: '0.85rem' }}>
                {product.discount_percent}% OFF
              </span>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-start">
            <h1 className="font-display mb-2" style={{ fontSize: '2rem' }}>{product.name}</h1>
            <button
              onClick={toggleWishlist}
              title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
              style={{
                background: '#fff', border: '1px solid var(--color-border)', borderRadius: '50%',
                width: '42px', height: '42px', cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? '#b0433f' : 'none'} stroke={isSaved ? '#b0433f' : '#7A7870'} strokeWidth="2">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
            </button>
          </div>

          <div className="mb-3">
            {hasDiscount ? (
              <>
                <span className="price" style={{ fontSize: '1.6rem' }}>₹{finalPrice}</span>
                <span className="ms-2" style={{ color: 'var(--color-muted)', textDecoration: 'line-through' }}>₹{product.price}</span>
              </>
            ) : (
              <span className="price" style={{ fontSize: '1.6rem' }}>₹{product.price}</span>
            )}
          </div>

          <p style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>{product.description}</p>

          <div className="mb-3">
            {outOfStock ? (
              <span className="badge bg-danger">Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="badge bg-warning text-dark">Only {product.stock} left in stock</span>
            ) : (
              <span className="badge bg-success">In Stock</span>
            )}
          </div>

          {message && <div className="alert alert-info py-2">{message}</div>}

          {!outOfStock && (
            <>
              {sizeOptions.length > 0 && (
                <div className="mb-4">
                  <div style={{ fontWeight: 500, marginBottom: '0.6rem' }}>Size</div>
                  <div className="d-flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        style={{
                          minWidth: '42px', padding: '0.5rem 0.8rem',
                          border: selectedSize === size ? '2px solid var(--color-ink)' : '1px solid var(--color-border)',
                          borderRadius: '3px', background: '#fff',
                          fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                          fontWeight: selectedSize === size ? 600 : 400,
                          cursor: 'pointer'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex align-items-center gap-3 mb-4">
                <span style={{ fontWeight: 500 }}>Quantity</span>
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                  <span style={{ minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
                </div>
              </div>

              <div className="d-flex gap-3">
                <button className="btn-boutique" onClick={addToCart}>Add to Cart</button>
                <button
                  className="btn"
                  onClick={buyNow}
                  style={{
                    border: '1px solid var(--color-ink)', color: 'var(--color-ink)',
                    borderRadius: '2px', padding: '0.7rem 1.75rem', fontSize: '0.95rem'
                  }}
                >
                  Buy Now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;