'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { swrFetcher, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { TimeAgo } from '@/components/time-ago';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  admin: { label: 'Admin', cls: 'tag tag-urgent' },
  viewer: { label: 'Viewer', cls: 'tag tag-general' },
};

export default function MembersPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { data, isLoading, mutate } = useSWR<PaginatedResponse<User>>(
    isAuthenticated ? '/v1/auth/users?page=1&limit=100' : null,
    swrFetcher,
  );
  const [updating, setUpdating] = useState<number | null>(null);

  async function updateRole(user: User, role: string) {
    if (updating || role === user.role) return;
    setUpdating(user.id);
    try {
      await api(`/v1/auth/users/${user.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      toast({ title: `${user.name} is now ${role}` });
      mutate();
    } catch {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="mx-auto max-w-170">
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
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1.8"
            >
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
                  <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <Select
                    value={user.role}
                    onValueChange={(role) => updateRole(user, role)}
                    disabled={updating === user.id}
                  >
                    <SelectTrigger
                      className={`${ROLE_BADGE[user.role]?.cls ?? 'tag tag-general'} h-auto cursor-pointer gap-1.5 border-0 px-2.5 py-1 text-xs`}
                      style={{ background: 'transparent' }}
                    >
                      {updating === user.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <span className="tag-dot" />
                      )}
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={ROLE_BADGE[user.role]?.cls ?? 'tag tag-general'}>
                    <span className="tag-dot" />
                    {ROLE_BADGE[user.role]?.label ?? user.role.toUpperCase()}
                  </span>
                )}
                <span
                  className="font-mono text-xs w-full"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  <TimeAgo date={user.createdAt} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
