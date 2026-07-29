'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';

function ClientToaster() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <Toaster />;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ClientToaster />
    </AuthProvider>
  );
}
