'use client';

import { useState, useEffect } from 'react';

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

export function TimeAgo({ date }: { date: string }) {
  const [text, setText] = useState('');
  useEffect(() => {
    setText(formatTime(date));
  }, [date]);
  return <>{text || date}</>;
}
