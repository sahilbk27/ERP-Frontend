import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { decodeToken } from '../api/jwt';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      const claims = decodeToken(token);
      if (claims) {
        setUser({ username: claims.sub, role: claims.role });
      }
    }
    setLoading(false);
  }, []);

  async function login(username, password) {
    const res = await api.post('/auth-service/api/auth/login', { username, password });
    const { token } = res.data;
    localStorage.setItem('erp_token', token);
    const claims = decodeToken(token);
    const loggedInUser = { username: claims.sub, role: claims.role };
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(username, password, role) {
    await api.post('/auth-service/api/auth/register', { username, password, role });
  }

  function logout() {
    localStorage.removeItem('erp_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
