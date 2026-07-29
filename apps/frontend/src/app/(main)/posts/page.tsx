'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { swrFetcher, api, ApiError } from '@/lib/api';
import { postSchema, type PostData } from '@/lib/schemas';
import { useAuth } from '@/lib/auth';
import { TimeAgo } from '@/components/time-ago';
import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';
import { ConfirmModal } from '@/components/confirm-modal';
import { toast } from '@/hooks/use-toast';
import { FileText, Loader2, Plus } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

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

const LIMIT = 10;

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

export default function PostsPage() {
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedCat, setSelectedCat] = useState('general');

  const {
    data: posts,
    isLoading,
    mutate,
  } = useSWR<PaginatedResponse<Post>>(`/v1/posts?page=${page}&limit=${LIMIT}`, swrFetcher);

  const { data: categories } = useSWR<PaginatedResponse<Category>>(
    '/v1/categories?page=1&limit=50',
    swrFetcher,
  );

  const form = useForm<PostData>({
    resolver: zodResolver(postSchema),
  });

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
      setOpen(false);
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

  return (
    <>
      <div>
        <div className="mx-auto max-w-170">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold tracking-tight">Posts</h1>
            {isAdmin && (
              <button className="btn-new" onClick={() => setOpen(true)}>
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                New Post
              </button>
            )}
          </div>

          {!posts || posts.items.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No posts"
              description="Create the first announcement."
              action={
                isAdmin ? (
                  <button className="btn-primary" onClick={() => setOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    New Post
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="relative">
              <div
                className="absolute left-0 top-1.5 bottom-0 w-px"
                style={{ background: 'hsl(var(--border))' }}
              />
              <div className="space-y-4">
                {posts.items.map((post) => (
                  <div
                    key={post.id}
                    className="post-card"
                    style={{ background: 'hsl(var(--card))' }}
                  >
                    <div className="tick-line" />
                    <div
                      className="tick-dot"
                      style={{
                        background:
                          post.category?.name?.toLowerCase() === 'urgent'
                            ? 'hsl(var(--urgent))'
                            : post.category?.name?.toLowerCase() === 'event'
                              ? 'hsl(var(--event))'
                              : 'hsl(var(--muted-foreground))',
                        borderColor: 'hsl(var(--background))',
                      }}
                    />

                    <div className="mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">{catTag(post.category?.name)}</div>
                      <span
                        className="font-mono text-xs"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        <TimeAgo date={post.createdAt} />
                      </span>
                    </div>

                    <h3 className="font-display mb-1.5 text-[15.5px] font-semibold tracking-tight">
                      {post.title}
                    </h3>
                    <p
                      className="mb-3 text-[13.8px] leading-relaxed whitespace-pre-wrap"
                      style={{ color: '#b7bec9' }}
                    >
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
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Pagination
                  page={posts.page}
                  totalPages={posts.totalPages}
                  total={posts.total}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}

          {/* Create modal */}
          {open && (
            <div
              className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
              style={{ background: 'rgba(6, 7, 10, 0.6)', backdropFilter: 'blur(3px)' }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setOpen(false);
                  form.reset();
                  setSelectedCat('general');
                }
              }}
            >
              <div
                className="w-full max-w-110 animate-[enter_0.2s_ease_both] rounded-2xl p-6"
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
                      className="field-input min-h-20 resize-y"
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
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => {
                        setOpen(false);
                        form.reset();
                        setSelectedCat('general');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary mt-0!"
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
        </div>
      </div>

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
    </>
  );
}
