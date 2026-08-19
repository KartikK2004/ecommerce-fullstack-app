import { createContext, useState, useContext } from 'react';

// Context lets us share "who is logged in" across ALL components
// without passing it manually through every single one (called "prop drilling").
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Try to load a previously logged-in user from localStorage on first load
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so components can just do: const { user, login, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
