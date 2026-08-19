import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';

// Import Bootstrap's CSS so all the "btn", "card", "navbar" classes work
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    // AuthProvider wraps everything so any page can check "who is logged in"
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          {/* We'll add /orders, /admin routes next */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
