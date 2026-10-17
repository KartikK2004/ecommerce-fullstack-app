import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Admin from './pages/Admin';

import 'bootstrap/dist/css/bootstrap.min.css';

// HashRouter keeps routes after a "#" (e.g. /#/cart), which works on GitHub Pages
// where page refreshes on normal routes would otherwise show a 404.
function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />

          <div className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            </Routes>
          </div>

          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;