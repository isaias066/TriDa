import { createContext, useContext, useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('trida-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('trida-token');

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` }
        });

        if (!res.ok) throw new Error('Token inválido');

        const userData = await res.json();
        setUser(userData);
        setToken(savedToken);
      } catch (err) {
        localStorage.removeItem('trida-token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    localStorage.setItem('trida-token', data.token);
    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem('trida-token');
    setToken(null);
    setUser(null);
  };

  const register = async ({ nombre_completo, email, password, rol }) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nombre_completo, email, password, rol })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al registrar usuario');
    }

    return data;
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin         = user?.rol === 'ADMINISTRADOR';

  return (
    <AuthCtx.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);