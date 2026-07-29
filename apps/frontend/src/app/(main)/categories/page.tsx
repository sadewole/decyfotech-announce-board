'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { swrFetcher, api, ApiError } from '@/lib/api';
import { categorySchema, type CategoryData } from '@/lib/schemas';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/header';
import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';
import { ConfirmModal } from '@/components/confirm-modal';
import { toast } from '@/hooks/use-toast';
import { FolderPlus, Loader2, Plus, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const LIMIT = 12;

export default function CategoriesPage() {
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, mutate } = useSWR<PaginatedResponse<Category>>(
    `/v1/categories?page=${page}&limit=${LIMIT}`,
    swrFetcher,
  );

  const form = useForm<CategoryData>({
    resolver: zodResolver(categorySchema),
  });

  async function onSubmit(data: CategoryData) {
    try {
      await api('/v1/categories', { method: 'POST', body: JSON.stringify(data) });
      setOpen(false);
      form.reset();
      toast({ title: 'Category created' });
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
        toast({ title: 'Error', description: 'Failed to create category', variant: 'destructive' });
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/v1/categories/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      toast({ title: 'Category deleted' });
      mutate();
    } catch {
      toast({
        title: 'Cannot delete',
        description: 'Category has posts. Move or delete them first.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="bg-grid" />
      <Header />

      <main className="relative z-1 mx-auto max-w-5xl px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-[680px]">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold tracking-tight">Categories</h1>
            {isAdmin && (
              <button className="btn-new" onClick={() => setOpen(true)}>
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                New Category
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                className="h-6 w-6 animate-spin"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              />
            </div>
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              icon={FolderPlus}
              title="No categories"
              description="Create a category to organize posts."
              action={
                isAdmin ? (
                  <button className="btn-primary" onClick={() => setOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    New Category
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.items.map((cat) => (
                  <div
                    key={cat.id}
                    className="rounded-2xl border p-5"
                    style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-semibold">{cat.name}</h3>
                      {isAdmin && (
                        <button
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-destructive"
                          style={{ background: '#0e1016', border: '1px solid hsl(var(--border))' }}
                          onClick={() => setDeleteTarget(cat)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p
                      className="mt-2 font-mono text-xs"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                    >
                      Created {new Date(cat.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                onPageChange={setPage}
              />
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
                }
              }}
            >
              <div
                className="w-full max-w-[440px] animate-[enter_0.2s_ease_both] rounded-2xl p-6"
                style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              >
                <h2 className="font-display mb-4 text-lg font-semibold">New Category</h2>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="field">
                    <label className="field-label">Name</label>
                    <input
                      className="field-input"
                      placeholder="Category name"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="mt-1 text-xs" style={{ color: 'hsl(var(--urgent))' }}>
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => {
                        setOpen(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary !mt-0"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Create'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Delete category?"
        description={deleteTarget ? `"${deleteTarget.name}" will be permanently deleted.` : ''}
        loading={deleting}
      />
    </div>
  );
}
