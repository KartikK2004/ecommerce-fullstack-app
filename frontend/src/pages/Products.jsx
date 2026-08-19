import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/Hero';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');   // what the user is typing right now
  const [searchQuery, setSearchQuery] = useState('');  // the term we actually search for (after debounce)
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  // Fetch categories once when the page first loads
  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce: wait 400ms after the user stops typing before actually searching.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Re-fetch products whenever the selected category OR search query changes
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      params.limit = 50;

      const response = await api.get('/products', { params });
      setProducts(response.data.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      setMessage('Please login to add items to cart');
      return;
    }
    try {
      await api.post('/cart', { product_id: productId, quantity: 1 });
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div>
      <Hero />

      <div className="container py-4" id="shop">

        {/* Category nav bar - horizontal, scrollable underline tabs */}
        <div
          className="mb-4 bg-white border-bottom"
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

        {/* Search bar */}
        <div className="mb-4">
          <div
            className="d-flex align-items-center bg-white rounded-pill px-3 py-2 border"
            style={{ maxWidth: '450px', borderColor: 'var(--color-border)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A7870" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="form-control border-0 shadow-none ms-2"
              placeholder="Search for products, brands and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ boxShadow: 'none', fontFamily: 'var(--font-body)' }}
            />
            {searchTerm && (
              <span
                role="button"
                className="px-2"
                style={{ color: 'var(--color-muted)' }}
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ✕
              </span>
            )}
          </div>
        </div>

        {message && <div className="alert alert-info">{message}</div>}

        {loading ? (
          <div className="text-center py-5" style={{ color: 'var(--color-muted)' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-5" style={{ color: 'var(--color-muted)' }}>No products found in this category.</div>
        ) : (
          <div className="row g-4 pb-5">
            {products.map((product) => (
              <div className="col-6 col-md-3" key={product.id}>
                <div className="product-card h-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="card-img-top"
                      style={{ height: '190px', objectFit: 'cover', borderRadius: '4px 4px 0 0' }}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{ height: '190px', backgroundColor: 'var(--color-accent-soft)' }}
                    >
                      <span style={{ color: 'var(--color-muted)' }}>No Image</span>
                    </div>
                  )}
                  <div className="card-body d-flex flex-column p-3">
                    <h6 className="mb-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                      {product.name}
                    </h6>
                    <p className="small mb-2" style={{ color: 'var(--color-muted)' }}>
                      {product.description}
                    </p>
                    <p className="price mb-3">₹{product.price}</p>
                    <button
                      className="btn-boutique mt-auto"
                      onClick={() => addToCart(product.id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
