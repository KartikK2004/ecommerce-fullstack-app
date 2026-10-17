import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = {
    color: 'var(--color-ink)',
    textDecoration: 'none',
    fontFamily: 'var(--font-body)',
    fontSize: '0.92rem',
    fontWeight: 500
  };

  return (
    <nav
      className="d-flex align-items-center justify-content-between page-container py-3"
      style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)' }}
    >
      <Link to="/" className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-ink)', textDecoration: 'none' }}>
        ShopEase
      </Link>

      <div className="d-flex align-items-center gap-4">
        {user && (
          <>
            <Link to="/wishlist" className="nav-icon-btn">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              Wishlist
            </Link>
            <Link to="/orders" className="nav-icon-btn">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 14l2 2 4-4" />
                <path d="M5 3h14a1 1 0 0 1 1 1v17l-3-2-2 2-2-2-2 2-2-2-2 2-3-2V4a1 1 0 0 1 1-1z" />
              </svg>
              My Orders
            </Link>
          </>
        )}
        {user?.role === 'admin' && (
          <Link to="/admin" style={linkStyle}>Admin</Link>
        )}

        {user ? (
          <>
            <Link to="/cart" className="nav-icon-btn">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Cart
            </Link>
            <span style={{ ...linkStyle, color: 'var(--color-muted)' }}>Hi, {user.name}</span>
            <button className="btn-boutique" onClick={handleLogout} style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" className="btn-boutique" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;