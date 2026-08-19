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
      className="d-flex align-items-center justify-content-between px-4 py-3"
      style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)' }}
    >
      <Link to="/" className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-ink)', textDecoration: 'none' }}>
        ShopEase
      </Link>

      <div className="d-flex align-items-center gap-4">
        {user && (
          <Link to="/orders" style={linkStyle}>My Orders</Link>
        )}
        {user?.role === 'admin' && (
          <Link to="/admin" style={linkStyle}>Admin</Link>
        )}

        {user ? (
          <>
            <Link to="/cart" style={linkStyle}>Cart</Link>
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
