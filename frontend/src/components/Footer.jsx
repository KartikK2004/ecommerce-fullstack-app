import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-ink)', color: '#fff', marginTop: '4rem' }}>
      <div className="page-container" style={{ paddingTop: '3.5rem', paddingBottom: '2rem' }}>
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="font-display mb-2" style={{ fontSize: '1.4rem' }}>ShopEase</div>
            <p className="small" style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '320px' }}>
              Fashion, footwear, and accessories for men, women, and kids —
              curated with care.
            </p>
          </div>

          <div className="col-6 col-lg-2">
            <div className="small fw-semibold mb-3" style={{ letterSpacing: '0.04em' }}>SHOP</div>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/" className="footer-link">All Products</Link></li>
              <li><Link to="/cart" className="footer-link">Cart</Link></li>
              <li><Link to="/orders" className="footer-link">My Orders</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <div className="small fw-semibold mb-3" style={{ letterSpacing: '0.04em' }}>COMPANY</div>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><span className="footer-link">About Us</span></li>
              <li><span className="footer-link">Careers</span></li>
              <li><span className="footer-link">Contact</span></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <div className="small fw-semibold mb-3" style={{ letterSpacing: '0.04em' }}>SUPPORT</div>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><span className="footer-link">Shipping Info</span></li>
              <li><span className="footer-link">Returns</span></li>
              <li><span className="footer-link">FAQs</span></li>
            </ul>
          </div>

          <div className="col-lg-2">
            <div className="small fw-semibold mb-3" style={{ letterSpacing: '0.04em' }}>NEWSLETTER</div>
            <p className="small" style={{ color: 'rgba(255,255,255,0.6)' }}>Get updates on new arrivals</p>
          </div>
        </div>

        <div
          className="d-flex justify-content-between align-items-center mt-4 pt-3 small"
          style={{ borderTop: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
        >
          <span>© {new Date().getFullYear()} ShopEase. All rights reserved.</span>
          <span>Built with React, Node.js &amp; MySQL</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;