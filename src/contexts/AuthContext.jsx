import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('token');
    if (!tokenFromStorage) {
      setLoadingAuth(false);
      return;
    }

    // Try to initialize user from localStorage as a fallback (helps when backend CORS blocks /auth/me)
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
        setToken(tokenFromStorage);
        setLoadingAuth(false); // mark as loaded since we have localStorage data
      } catch (e) {
        // ignore parse errors
      }
    }

    const restoreUser = async () => {
      try {
        const userRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${tokenFromStorage}` }
        });
        setToken(tokenFromStorage);
        setUser(userRes.data);
      } catch (err) {
        console.error('Auth restore failed:', err);
        // if API call fails and we already set user from localStorage, keep it; otherwise clear
        if (!localUser) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setLoadingAuth(false);
        }
      }
    };

    restoreUser();
  }, []);

  const login = async (email, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      const res = await api.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      localStorage.setItem('token', res.data.access_token);
      setToken(res.data.access_token);
      const userRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${res.data.access_token}` }
      });
      setUser(userRes.data);
    } catch (err) {
      console.error(err);
      alert('Login failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loadingAuth) {
    return null;
  }

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
