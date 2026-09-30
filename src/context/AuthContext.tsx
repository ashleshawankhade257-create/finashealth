import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<User>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  handleGoogleCredential: (credential: string) => Promise<User>;
  refreshUser: () => Promise<void>;
  updateUserLocal: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('credit_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Initial auth verification
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('credit_token');
      if (storedToken) {
        try {
          const currentUser = await authAPI.getMe();
          setUser(currentUser);
        } catch (error) {
          console.warn('Stored token is invalid or expired:', error);
          localStorage.removeItem('credit_token');
          localStorage.removeItem('credit_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('credit_token', res.access_token);
    localStorage.setItem('credit_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string): Promise<User> => {
    const res = await authAPI.register({ name, email, password, confirm_password: confirmPassword });
    localStorage.setItem('credit_token', res.access_token);
    localStorage.setItem('credit_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('credit_token');
      localStorage.removeItem('credit_user');
      setToken(null);
      setUser(null);
    }
  };

  const loginWithGoogle = async () => {
    // Check if Google GIS is available on window
    const google = (window as any).google;
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

    if (google && clientId) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          if (response.credential) {
            await handleGoogleCredential(response.credential);
          }
        },
      });
      google.accounts.id.prompt();
    } else {
      // Standard OAuth 2.0 Web redirect flow
      try {
        const url = await authAPI.getGoogleLoginUrl(window.location.origin);
        window.location.href = url;
      } catch (err) {
        console.error('Failed to initiate Google OAuth redirect:', err);
        throw new Error('Google OAuth is not configured yet with valid Client ID in .env. Please see the README instructions or use Demo Account to explore all features.');
      }
    }
  };

  const handleGoogleCredential = async (credential: string): Promise<User> => {
    const res = await authAPI.verifyGoogleToken(credential);
    localStorage.setItem('credit_token', res.access_token);
    localStorage.setItem('credit_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authAPI.getMe();
      setUser(currentUser);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const updateUserLocal = (updated: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updated };
      setUser(merged);
      localStorage.setItem('credit_user', JSON.stringify(merged));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        loginWithGoogle,
        handleGoogleCredential,
        refreshUser,
        updateUserLocal,
      }}
    >
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
