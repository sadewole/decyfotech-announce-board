'use client';

import { TimeAgo } from '@/components/time-ago';

interface PostItemProps {
  post: Post;
  isAdmin: boolean;
  onDelete: (post: Post) => void;
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

export function PostItem({ post, isAdmin, onDelete }: PostItemProps) {
  return (
    <div className="post-card" style={{ background: 'hsl(var(--card))' }}>
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
        <span className="font-mono text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
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
            style={{
              background: '#1D2330',
              border: '1px solid hsl(var(--border))',
            }}
          >
            {(post.author?.name ?? 'U').charAt(0).toUpperCase()}
          </div>
          <span>Posted by {post.author?.name ?? 'team'}</span>
        </div>

        {isAdmin && (
          <button className="btn-delete" onClick={() => onDelete(post)}>
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
  );
}
