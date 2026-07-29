'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
  useRef,
} from 'react';
import { api } from './api';
import { useRouter } from 'next/navigation';
import { getAuthCookie, setAuthCookie, removeAuthCookie } from './cookie';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  signup: (data: { email: string; password: string; name: string }) => Promise<void>;
  signin: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ user: null, token: null });
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    setState(getAuthCookie<AuthState>() ?? { user: null, token: null });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;
    if (state.token) {
      setAuthCookie(state);
    } else {
      removeAuthCookie();
    }
  }, [state]);

  const signup = useCallback(async (data: { email: string; password: string; name: string }) => {
    const res = await api<{ token: string; user: User }>('/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setState({ user: res.user, token: res.token });
  }, []);

  const signin = useCallback(async (data: { email: string; password: string }) => {
    const res = await api<{ token: string; user: User }>('/v1/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setState({ user: res.user, token: res.token });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null });
    router.push('/');
  }, [router]);

  const value = useMemo(
    () => ({
      ...state,
      isLoading,
      signup,
      signin,
      logout,
      isAuthenticated: !!state.token,
      isAdmin: state.user?.role === 'admin',
    }),
    [state, signup, signin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
