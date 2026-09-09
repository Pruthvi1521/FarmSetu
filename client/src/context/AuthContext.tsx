import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../../../shared/types';
import { apiFetch } from '../services/api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  loginDemo: (role: 'FARMER' | 'BUYER' | 'ADMIN') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('farmsetu_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        // Auto-login as Demo Farmer by default for instant hackathon evaluation
        await loginDemo('FARMER');
        return;
      }
      try {
        const res = await apiFetch<{ user: IUser }>('/auth/me');
        setUser(res.user);
      } catch (err) {
        console.warn('Token validation failed, resetting to Demo Farmer:', err);
        localStorage.removeItem('farmsetu_token');
        setToken(null);
        await loginDemo('FARMER');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const loginDemo = async (role: 'FARMER' | 'BUYER' | 'ADMIN') => {
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: IUser }>('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role })
      });
      localStorage.setItem('farmsetu_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      console.error('Demo login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('farmsetu_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
