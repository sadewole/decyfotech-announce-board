'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { swrFetcher, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';
import { ConfirmModal } from '@/components/confirm-modal';
import { CreatePostModal } from '@/components/posts/create-post-modal';
import { PostFilters } from '@/components/posts/post-filters';
import { PostItem } from '@/components/posts/post-item';
import { toast } from '@/hooks/use-toast';
import { FileText, Loader2, Plus } from 'lucide-react';

const LIMIT = 10;

export default function PostsPage() {
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const dateError = !!(filterStart && filterEnd && filterEnd < filterStart);

  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (filterCategory) params.set('categoryId', filterCategory);
  if (filterStart && !dateError) params.set('startDate', filterStart);
  if (filterEnd && !dateError) params.set('endDate', filterEnd);
  const query = params.toString();

  const {
    data: posts,
    isLoading,
    mutate,
  } = useSWR<PaginatedResponse<Post>>(`/v1/posts?${query}`, swrFetcher);

  const { data: categories } = useSWR<PaginatedResponse<Category>>(
    '/v1/categories?page=1&limit=50',
    swrFetcher,
  );

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

  function handleFilterCategory(v: string) {
    setFilterCategory(v);
    setPage(1);
  }
  function handleStartChange(v: string) {
    setFilterStart(v);
    setPage(1);
  }
  function handleEndChange(v: string) {
    setFilterEnd(v);
    setPage(1);
  }
  function handleClearFilters() {
    setFilterCategory('');
    setFilterStart('');
    setFilterEnd('');
    setPage(1);
  }

  return (
    <>
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

        <PostFilters
          categories={categories?.items}
          filterCategory={filterCategory}
          filterStart={filterStart}
          filterEnd={filterEnd}
          dateError={dateError}
          onCategoryChange={handleFilterCategory}
          onStartChange={handleStartChange}
          onEndChange={handleEndChange}
          onClear={handleClearFilters}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              className="h-6 w-6 animate-spin"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            />
          </div>
        ) : !posts || posts.items.length === 0 ? (
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
                <PostItem key={post.id} post={post} isAdmin={isAdmin} onDelete={setDeleteTarget} />
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
      </div>

      <CreatePostModal
        open={open}
        onOpenChange={setOpen}
        categories={categories?.items}
        onSuccess={mutate}
      />

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
