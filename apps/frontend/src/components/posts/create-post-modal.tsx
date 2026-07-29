'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, ApiError } from '@/lib/api';
import { postSchema, type PostData } from '@/lib/schemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: Category[];
  onSuccess: () => void;
}

export function CreatePostModal({ open, onOpenChange, categories, onSuccess }: CreatePostModalProps) {
  const [selectedCat, setSelectedCat] = useState('');

  const form = useForm<PostData>({ resolver: zodResolver(postSchema) });

  async function onSubmit(data: PostData) {
    try {
      await api('/v1/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          categoryId: selectedCat ? Number(selectedCat) : undefined,
        }),
      });
      onOpenChange(false);
      form.reset();
      setSelectedCat('');
      toast({ title: 'Post created' });
      onSuccess();
    } catch (err) {
      const msg =
        err instanceof ApiError && typeof err.body === 'object' && err.body && 'message' in err.body
          ? (err.body as { message: string }).message
          : 'Failed to create post';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      style={{ background: 'rgba(6, 7, 10, 0.6)', backdropFilter: 'blur(3px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
          form.reset();
          setSelectedCat('');
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
            <input className="field-input" placeholder="What's the headline?" {...form.register('title')} />
            {form.formState.errors.title && (
              <p className="mt-1 text-xs" style={{ color: 'hsl(var(--urgent))' }}>{form.formState.errors.title.message}</p>
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
              <p className="mt-1 text-xs" style={{ color: 'hsl(var(--urgent))' }}>{form.formState.errors.content.message}</p>
            )}
          </div>
          <div className="field">
            <label className="field-label">Category</label>
            <Select value={selectedCat} onValueChange={setSelectedCat}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2.5 pt-1">
            <button type="button" className="btn-ghost" onClick={() => { onOpenChange(false); form.reset(); setSelectedCat(''); }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary mt-0!" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
