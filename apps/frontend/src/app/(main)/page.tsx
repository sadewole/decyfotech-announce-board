'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { swrFetcher, api, ApiError } from '@/lib/api';
import { postSchema, type PostData } from '@/lib/schemas';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/header';
import { ConfirmModal } from '@/components/confirm-modal';
import { toast } from '@/hooks/use-toast';
import { Loader2, Rss } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  categoryId: number | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author?: { id: number; name: string; email: string };
  category?: { id: number; name: string } | null;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function catTag(name: string | undefined | null) {
  const n = name?.toLowerCase() ?? 'general';
  const cls = n === 'urgent' ? 'tag-urgent' : n === 'event' ? 'tag-event' : 'tag-general';
  return (
    <span className={`tag ${cls}`}>
      <span className="tag-dot" />
      {(name ?? 'General').toUpperCase()}
    </span>
  );
}

function catColor(name: string | undefined | null) {
  const n = name?.toLowerCase() ?? 'general';
  if (n === 'urgent') return 'hsl(var(--urgent))';
  if (n === 'event') return 'hsl(var(--event))';
  return 'hsl(var(--muted-foreground))';
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HomePage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState('general');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: posts,
    isLoading,
    mutate,
  } = useSWR<PaginatedResponse<Post>>('/v1/posts?page=1&limit=50', swrFetcher);

  const form = useForm<PostData>({ resolver: zodResolver(postSchema) });

  async function onSubmit(data: PostData) {
    try {
      await api('/v1/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          categoryId: selectedCat === 'general' ? undefined : undefined,
        }),
      });
      setShowModal(false);
      form.reset();
      setSelectedCat('general');
      toast({ title: 'Post created' });
      mutate();
    } catch (err) {
      if (
        err instanceof ApiError &&
        typeof err.body === 'object' &&
        err.body &&
        'message' in err.body
      ) {
        toast({
          title: 'Error',
          description: (err.body as { message: string }).message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Error', description: 'Failed to create post', variant: 'destructive' });
      }
    }
  }

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => {
    setShowModal(false);
    form.reset();
    setSelectedCat('general');
  }, [form]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/v1/posts/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      toast({ title: 'Post deleted' });
      mutate();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete post', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        <div className="bg-grid" />
        <Header />
        <main className="relative z-1 mx-auto max-w-3xl px-4 py-20 sm:px-8 sm:py-28">
          <div className="text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            >
              <Rss className="h-7 w-7" style={{ color: 'hsl(var(--primary))' }} strokeWidth={1.8} />
            </div>
            <h1 className="font-display mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Decyfotech — Announcement Board
            </h1>
            <p
              className="mx-auto mb-8 max-w-lg text-[15px] leading-relaxed"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Catch every announcement the moment it's transmitted. A lightweight board for teams
              that need to stay in sync.
            </p>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Sign in to view the transmission log.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="bg-grid" />
      <Header onNewPost={isAdmin ? openModal : undefined} />

      <main className="relative z-1 mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-[680px]">
          <div className="mb-5 flex items-baseline justify-between">
            <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Transmission log
            </span>
            <span className="font-mono text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {posts ? `${posts.total} ${posts.total === 1 ? 'post' : 'posts'}` : '...'}
            </span>
          </div>

          <div className="relative">
            <div
              className="absolute left-0 top-1.5 bottom-0 w-px"
              style={{ background: 'hsl(var(--border))' }}
            />

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2
                  className="h-6 w-6 animate-spin"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                />
              </div>
            ) : !posts || posts.items.length === 0 ? (
              <div className="empty-state ml-7">
                <div className="empty-state-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth="1.8"
                  >
                    <path d="M4 4h16v12H8l-4 4V4z" />
                  </svg>
                </div>
                <h3>Nothing transmitted yet</h3>
                <p>Post the first announcement to get things on the record.</p>
                {isAdmin && (
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '9px 18px' }}
                    onClick={openModal}
                  >
                    New announcement
                  </button>
                )}
              </div>
            ) : (
              <ul className="m-0 list-none p-0">
                {posts.items.map((post) => (
                  <li
                    key={post.id}
                    className="post-card"
                    style={{ background: 'hsl(var(--card))' }}
                  >
                    <div className="tick-line" />
                    <div
                      className="tick-dot"
                      style={{
                        background: catColor(post.category?.name),
                        borderColor: 'hsl(var(--background))',
                      }}
                    />

                    <div className="mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">{catTag(post.category?.name)}</div>
                      <span
                        className="font-mono text-xs"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        {formatTime(post.createdAt)}
                      </span>
                    </div>

                    <h3 className="font-display mb-1.5 text-[15.5px] font-semibold tracking-tight">
                      {post.title}
                    </h3>
                    <p className="mb-3 text-[13.8px] leading-relaxed" style={{ color: '#b7bec9' }}>
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-2 text-xs"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
                          style={{ background: '#1D2330', border: '1px solid hsl(var(--border))' }}
                        >
                          {(post.author?.name ?? 'U').charAt(0).toUpperCase()}
                        </div>
                        <span>Posted by {post.author?.name ?? 'team'}</span>
                      </div>

                      {isAdmin && (
                        <button className="btn-delete" onClick={() => setDeleteTarget(post)}>
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* New announcement modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
          style={{ background: 'rgba(6, 7, 10, 0.6)', backdropFilter: 'blur(3px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="w-full max-w-[440px] animate-[enter_0.2s_ease_both] rounded-2xl p-6"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          >
            <h2 className="font-display mb-4 text-lg font-semibold">New announcement</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="field">
                <label className="field-label">Title</label>
                <input
                  className="field-input"
                  placeholder="What's the headline?"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="mt-1 text-xs" style={{ color: 'hsl(var(--urgent))' }}>
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="field">
                <label className="field-label">Message</label>
                <textarea
                  className="field-input min-h-[80px] resize-y"
                  placeholder="Share the details..."
                  rows={4}
                  {...form.register('content')}
                />
                {form.formState.errors.content && (
                  <p className="mt-1 text-xs" style={{ color: 'hsl(var(--urgent))' }}>
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>
              <div className="field">
                <label className="field-label">Category</label>
                <div className="flex gap-2">
                  {['general', 'event', 'urgent'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`cat-btn ${selectedCat === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCat(cat)}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2.5 pt-1">
                <button type="button" className="btn-ghost flex-1" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 !mt-0"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Delete post?"
        description={deleteTarget ? `"${deleteTarget.title}" will be permanently deleted.` : ''}
        loading={deleting}
      />
    </div>
  );
}
