'use client';

import { useEffect, useCallback, useState, useSyncExternalStore, type ReactNode } from 'react';

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

type Listener = (toast: Toast) => void;

let listeners: Listener[] = [];

export function toast(options: ToastOptions) {
  const id = genId();
  const t: Toast = { id, ...options };
  listeners.forEach((fn) => fn(t));
  return id;
}

function subscribe(cb: Listener) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function getSnapshot() {
  return listeners.slice();
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, t.variant === 'destructive' ? 8000 : 5000);
  }, []);

  useEffect(() => {
    const unsub = subscribe(addToast);
    return unsub;
  }, [addToast]);

  return { toasts, toast };
}
