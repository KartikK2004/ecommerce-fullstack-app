import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../auth.css';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/auth/register', formData);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container d-flex justify-content-center" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="eyebrow mb-2">Join us</div>
        <h2 className="font-display mb-4" style={{ fontSize: '1.9rem' }}>Create your account</h2>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="auth-label">Name</label>
            <input
              type="text"
              name="name"
              className="auth-input"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="auth-label">Email</label>
            <input
              type="email"
              name="email"
              className="auth-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="auth-label">Password</label>
            <input
              type="password"
              name="password"
              className="auth-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-boutique w-100">Register</button>
        </form>

        <p className="mt-4 text-center small" style={{ color: 'var(--color-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
