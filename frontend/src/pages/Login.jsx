import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container d-flex justify-content-center" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="eyebrow mb-2">Welcome back</div>
        <h2 className="font-display mb-4" style={{ fontSize: '1.9rem' }}>Login to your account</h2>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-boutique w-100">Login</button>
        </form>

        <p className="mt-4 text-center small" style={{ color: 'var(--color-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
