import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap any page with this to require login (and optionally admin role).
// Usage: <ProtectedRoute><Cart /></ProtectedRoute>
//        <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in at all -> redirect to login.
  // We pass the page they were trying to reach in "state", so after logging in
  // we could send them back there (a nice UX touch, optional to use later).
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in, but this route requires admin and they're not one -> send home.
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Passed all checks -> render the actual page
  return children;
}

export default ProtectedRoute;
