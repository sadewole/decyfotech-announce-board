'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';

const CACHE_KEY = 'swr-cache';

function localStorageProvider() {
  if (typeof window === 'undefined') return new Map();

  const stored = localStorage.getItem(CACHE_KEY);
  const map = new Map(stored ? JSON.parse(stored) : []);

  window.addEventListener('beforeunload', () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify([...map]));
  });

  return map;
}

function ClientToaster() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <Toaster />;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: localStorageProvider,
        revalidateOnFocus: true,
        dedupingInterval: 3000,
        keepPreviousData: true,
      }}
    >
      <AuthProvider>
        {children}
        <ClientToaster />
      </AuthProvider>
    </SWRConfig>
  );
}
