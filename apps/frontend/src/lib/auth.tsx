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

const AUTH_KEY = 'auth';

function loadAuth(): AuthState {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { user: null, token: null };
}

function saveAuth(state: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ user: null, token: null });
  const [isLoading, setIsLoading] = useState(true);

  const isMounted = useRef(false);

  // Load persisted auth AFTER initial hydration, not during render
  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    setState(loadAuth());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isMounted.current) return; // don't wipe localStorage before we've even read it
    if (state.token) {
      saveAuth(state);
    } else {
      clearAuth();
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

  console.log('first');

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
