import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthUser } from '@shared/types';

export interface AuthState {
  token: string | null;
  user: Omit<AuthUser, 'password'> | null;
}

interface AuthContextValue extends AuthState {
  login: (payload: AuthState) => void;
  signup: (userData: { name: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export const AUTH_STORAGE_KEY = 'prou-auth-state';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as AuthState;
      } catch {
        return { token: null, user: null };
      }
    }
    return { token: null, user: null };
  });

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = (payload: AuthState) => setState(payload);
  
  const signup = async (userData: { name: string; email: string; password: string; role: string }) => {
    const api = (await import('../api/client')).default;
    const { data } = await api.post('/auth/signup', userData);
    setState({ token: data.token, user: data.user });
  };
  
  const logout = () => setState({ token: null, user: null });

  return <AuthContext.Provider value={{ ...state, login, signup, logout }}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
};

