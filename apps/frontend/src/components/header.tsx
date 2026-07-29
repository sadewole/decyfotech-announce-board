'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmModal } from '@/components/confirm-modal';
import { LogOut, Plus, Users } from 'lucide-react';

interface HeaderProps {
  onNewPost?: () => void;
}

export function Header({ onNewPost }: HeaderProps) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{
        borderColor: 'hsl(var(--border))',
        background: 'rgba(11, 13, 18, 0.85)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/posts" className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-sm"
              style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              DB
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">Decyfotech</span>
          </Link>

          {isAuthenticated && (
            <div className="hidden items-center gap-2 sm:flex">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: 'hsl(var(--live))',
                  boxShadow: '0 0 0 0 rgba(95, 217, 164, 0.5)',
                  animation: 'pulse-dot 2.2s infinite',
                }}
              />
              <span className="text-xs text-muted-foreground">All systems live</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && isAdmin && onNewPost && (
            <button onClick={onNewPost} className="btn-new">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              New announcement
            </button>
          )}

          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sm font-semibold"
                  style={{ background: '#1D2330', border: '1px solid hsl(var(--border))' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                    <span className="text-xs font-normal text-muted-foreground capitalize">
                      {user.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/categories">Categories</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/members">
                    <Users className="mr-2 h-4 w-4" />
                    Members
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowLogoutModal(true)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        onConfirm={() => {
          logout();
          setShowLogoutModal(false);
        }}
        title="Sign out?"
        description="You'll need to sign in again to manage announcements."
        confirmLabel="Sign out"
      />
    </header>
  );
}
