import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', description: '', price: '', stock: '', image_url: '', category_id: '' };

function Admin() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = adding new, otherwise = product id being edited
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', { params: { limit: 100 } });
      setProducts(response.data.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || '',
      category_id: product.category_id || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      category_id: formData.category_id ? Number(formData.category_id) : null
    };

    try {
      if (editingId) {
        // Update existing product
        await api.put(`/products/${editingId}`, payload);
        setMessage('Product updated successfully');
      } else {
        // Create new product
        await api.post('/products', payload);
        setMessage('Product added successfully');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${productId}`);
      setMessage('Product deleted');
      fetchProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // ---- Role guard: block non-admins from seeing this page ----
  if (!user) {
    return (
      <div className="container mt-5 text-center py-5">
        <h4 className="font-display mb-3">Please log in</h4>
        <p style={{ color: 'var(--color-muted)' }}>You need to be logged in as an admin to view this page.</p>
        <Link to="/login" className="btn-boutique d-inline-block mt-2">Login</Link>
      </div>
    );
  }
  if (user.role !== 'admin') {
    return (
      <div className="container mt-5 text-center py-5">
        <h4 className="font-display mb-3">Access denied</h4>
        <p style={{ color: 'var(--color-muted)' }}>This page is only available to admin accounts.</p>
        <Link to="/" className="btn-boutique d-inline-block mt-2">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="font-display mb-4">Admin Dashboard</h2>

      {message && <div className="alert alert-info">{message}</div>}

      {/* Add / Edit form */}
      <div className="product-card p-4 mb-5">
        <h5 className="mb-3">{editingId ? 'Edit Product' : 'Add New Product'}</h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small">Name</label>
              <input
                type="text" name="name" className="form-control"
                value={formData.name} onChange={handleChange} required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small">Price (₹)</label>
              <input
                type="number" name="price" className="form-control" step="0.01"
                value={formData.price} onChange={handleChange} required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small">Stock</label>
              <input
                type="number" name="stock" className="form-control"
                value={formData.stock} onChange={handleChange} required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Image URL</label>
              <input
                type="text" name="image_url" className="form-control"
                value={formData.image_url} onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Category</label>
              <select
                name="category_id" className="form-select"
                value={formData.category_id} onChange={handleChange}
              >
                <option value="">— Select category —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label small">Description</label>
              <textarea
                name="description" className="form-control" rows="2"
                value={formData.description} onChange={handleChange}
              />
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn-boutique">
              {editingId ? 'Save Changes' : 'Add Product'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Product list table */}
      <h5 className="mb-3">All Products ({products.length})</h5>
      {loading ? (
        <p style={{ color: 'var(--color-muted)' }}>Loading products...</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ width: '60px' }}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <div style={{ width: '45px', height: '45px', backgroundColor: 'var(--color-accent-soft)', borderRadius: '4px' }} />
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>₹{product.price}</td>
                  <td>
                    {product.stock === 0 ? (
                      <span className="badge bg-danger">Out of stock</span>
                    ) : (
                      product.stock
                    )}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => startEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Admin;
