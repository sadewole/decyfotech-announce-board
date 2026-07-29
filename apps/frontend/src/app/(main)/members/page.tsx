'use client';

import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/header';
import { Loader2 } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
  createdAt: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  admin: { label: 'Admin', cls: 'tag tag-urgent' },
  viewer: { label: 'Viewer', cls: 'tag tag-general' },
};

export default function MembersPage() {
  const { isAuthenticated, isAdmin } = useAuth();

  const { data, isLoading } = useSWR<PaginatedResponse<User>>(
    isAuthenticated && isAdmin ? '/v1/auth/users?page=1&limit=100' : null,
    swrFetcher,
  );

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        <div className="bg-grid" />
        <Header />
        <main className="relative z-1 mx-auto max-w-5xl px-4 py-10 sm:px-8">
          <div className="mx-auto max-w-[680px] text-center py-20" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <p className="text-sm">Sign in to view members.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="bg-grid" />
      <Header />

      <main className="relative z-1 mx-auto max-w-5xl px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-[680px]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Members</h1>
              <p className="mt-0.5 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {data ? `${data.total} ${data.total === 1 ? 'member' : 'members'}` : '...'}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>No members</h3>
              <p>No users have joined yet.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {data.items.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5"
                  style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ background: '#1D2330', border: '1px solid hsl(var(--border))' }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={ROLE_BADGE[user.role]?.cls ?? 'tag tag-general'}>
                      <span className="tag-dot" />
                      {ROLE_BADGE[user.role]?.label ?? user.role.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
