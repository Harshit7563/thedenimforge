import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, type User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sendLoginOtp: (email: string, password: string) => Promise<{ email: string; message: string }>;
  verifyLoginOtp: (email: string, otp: string) => Promise<void>;
  sendRegisterOtp: (data: Record<string, unknown>) => Promise<{ email: string; message: string }>;
  verifyRegisterOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe().then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const sendLoginOtp = async (email: string, password: string) => {
    const res = await api.sendLoginOtp(email, password);
    return { email: res.email, message: res.message };
  };

  const verifyLoginOtp = async (email: string, otp: string) => {
    const { user, token } = await api.verifyLoginOtp(email, otp);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const sendRegisterOtp = async (data: Record<string, unknown>) => {
    const res = await api.sendRegisterOtp(data);
    return { email: res.email, message: res.message };
  };

  const verifyRegisterOtp = async (email: string, otp: string) => {
    const { user, token } = await api.verifyRegisterOtp(email, otp);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await api.getMe();
    setUser(me);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sendLoginOtp,
        verifyLoginOtp,
        sendRegisterOtp,
        verifyRegisterOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
