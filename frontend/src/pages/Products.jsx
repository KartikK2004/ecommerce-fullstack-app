import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/Hero';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    if (user) fetchWishlist();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      setWishlistIds(new Set(response.data.map((p) => p.id)));
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      const response = await api.get('/products', { params });
      setProducts(response.data.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const categoryName = (categoryId) => {
    const match = categories.find((c) => c.id === categoryId);
    return match ? match.name : null;
  };

  // Products that need a size send the user to the detail page to pick one
  const addToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setMessage('Please login to add items to cart');
      return;
    }
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

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setMessage('Please login to save items');
      return;
    }
    const isSaved = wishlistIds.has(productId);
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(productId);
      else next.add(productId);
      return next;
    });
    try {
      if (isSaved) await api.delete(`/wishlist/${productId}`);
      else await api.post('/wishlist', { product_id: productId });
    } catch (err) {
      console.error('Wishlist toggle failed:', err);
    }
  };

  const effectivePrice = (p) =>
    p.discount_percent > 0 ? p.price * (1 - p.discount_percent / 100) : Number(p.price);

  const visibleProducts = products
    .filter((p) => effectivePrice(p) <= maxPrice)
    .sort((a, b) => {
      if (sortBy === 'price_low') return effectivePrice(a) - effectivePrice(b);
      if (sortBy === 'price_high') return effectivePrice(b) - effectivePrice(a);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.id - a.id;
    });

  return (
    <div>
      <Hero />

      <div className="page-container py-5" id="shop">
        <div
          className="mb-4 bg-white border-bottom section-gap"
          style={{ overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'thin' }}
        >
          <div className="d-inline-flex">
            <span
              role="button"
              onClick={() => setSelectedCategory('')}
              className={`cat-tab ${selectedCategory === '' ? 'active' : ''}`}
            >
              All
            </span>
            {categories.map((cat) => (
              <span
                key={cat.id}
                role="button"
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`cat-tab ${selectedCategory === String(cat.id) ? 'active' : ''}`}
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-2 d-none d-lg-block">
            <div className="filter-sidebar">
              <div className="filter-heading">Search</div>
              <div
                className="d-flex align-items-center bg-white rounded-pill px-3 py-2 border mb-4"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7870" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="form-control border-0 shadow-none ms-2 p-0"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ boxShadow: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div className="filter-heading">Max Price: ₹{maxPrice}</div>
              <input
                type="range"
                className="form-range mb-4"
                min="200"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />

              <div className="filter-heading">Sort By</div>
              <div className="d-flex flex-column">
                {[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'price_low', label: 'Price: Low to High' },
                  { value: 'price_high', label: 'Price: High to Low' },
                  { value: 'name', label: 'Name (A–Z)' }
                ].map((opt) => (
                  <label key={opt.value} className="filter-checkbox-label">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortBy === opt.value}
                      onChange={() => setSortBy(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-10">
            {message && <div className="alert alert-info">{message}</div>}

            {loading ? (
              <div className="text-center py-5" style={{ color: 'var(--color-muted)' }}>Loading products...</div>
            ) : visibleProducts.length === 0 ? (
              <div className="text-center py-5" style={{ color: 'var(--color-muted)' }}>No products match your filters.</div>
            ) : (
              <div className="product-grid pb-5">
                {visibleProducts.map((product) => {
                  const hasDiscount = product.discount_percent > 0;
                  const finalPrice = effectivePrice(product).toFixed(2);
                  const isSaved = wishlistIds.has(product.id);

                  return (
                    <div key={product.id}>
                      <Link
                        to={`/product/${product.id}`}
                        className="product-card h-100 d-block"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div style={{ position: 'relative' }}>
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="card-img-top"
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

                          {hasDiscount && (
                            <span className="badge bg-danger" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                              {product.discount_percent}% OFF
                            </span>
                          )}

                          <button
                            onClick={(e) => toggleWishlist(e, product.id)}
                            title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                            style={{
                              position: 'absolute', top: '8px', right: '8px',
                              background: '#fff', border: 'none', borderRadius: '50%',
                              width: '32px', height: '32px', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}
                          >
                            <svg
                              width="16" height="16" viewBox="0 0 24 24"
                              fill={isSaved ? '#b0433f' : 'none'}
                              stroke={isSaved ? '#b0433f' : '#7A7870'}
                              strokeWidth="2"
                            >
                              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
                            </svg>
                          </button>
                        </div>

                        <div className="card-body d-flex flex-column p-3" style={{ padding: '1.1rem' }}>
                          {categoryName(product.category_id) && (
                            <span className="eyebrow mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
                              {categoryName(product.category_id)}
                            </span>
                          )}
                          <h6 className="mb-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                            {product.name}
                          </h6>
                          <p className="small mb-2" style={{ color: 'var(--color-muted)' }}>
                            {product.description}
                          </p>
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
                          <button className="btn-boutique mt-auto" onClick={(e) => addToCart(e, product)}>
                            {product.sizes ? 'Select Size' : 'Add to Cart'}
                          </button>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products;