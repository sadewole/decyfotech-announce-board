'use client';

import { useState, useCallback, type ReactNode } from 'react';

type ToastVariant = 'default' | 'destructive';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: ToastVariant;
}

interface ToastOptions {
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return String(count);
}

const listeners: Array<(toast: Toast) => void> = [];

export function toast(options: ToastOptions) {
  const id = genId();
  const t: Toast = { id, ...options };
  listeners.forEach((fn) => fn(t));
  return id;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, t.variant === 'destructive' ? 8000 : 5000);
  }, []);

  useState(() => {
    listeners.push(addToast);
  });

  return { toasts, toast };
}
