'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth';
import { signinSchema, signupSchema } from '@/lib/schemas';
import { ApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { signup, signin } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const isSignin = mode === 'signin';
  const schema = isSignin ? signinSchema : signupSchema;

  const form = useForm({
    resolver: zodResolver(schema),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = form;
  const r = register as (name: string) => ReturnType<typeof register>;

  async function onSubmit(data: Record<string, unknown>) {
    try {
      if (isSignin) {
        await signin({ email: data.email as string, password: data.password as string });
      } else {
        await signup({
          email: data.email as string,
          password: data.password as string,
          name: data.name as string,
        });
      }

      reset();
      toast({ title: isSignin ? 'Signed in' : 'Signed up', description: 'Welcome!' });
      router.push('/posts');
    } catch (err) {
      if (
        err instanceof ApiError &&
        typeof err.body === 'object' &&
        err.body &&
        'message' in err.body
      ) {
        (setError as any)('root', { message: (err.body as { message: string }).message });
      } else {
        (setError as any)('root', { message: 'Something went wrong' });
      }
    }
  }

  function switchMode() {
    reset();
    setMode(isSignin ? 'signup' : 'signin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div
        className="sm:max-w-100 w-full rounded-2xl! border p-0"
        style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
      >
        <div className="relative overflow-hidden rounded-2xl p-9">
          <svg
            className="pointer-events-none absolute left-0 right-0 top-0 h-16 opacity-50"
            viewBox="0 0 380 64"
            preserveAspectRatio="none"
          >
            <path
              d="M0,32 Q20,10 40,32 T80,32 T120,32 T160,32 T200,32 T240,32 T280,32 T320,32 T360,32"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              opacity="0.35"
            />
          </svg>

          <div className="mb-7 flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold"
              style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              DB
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              Decyfotech board
            </span>
          </div>

          <div className="p-0">
            <p className="font-display text-xl font-semibold tracking-tight">
              {isSignin ? 'Sign in' : 'Create account'}
            </p>
            <p className="mt-1.5 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {isSignin
                ? "Catch every announcement the moment it's transmitted."
                : 'Join to start posting announcements.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {!isSignin && (
              <div className="field">
                <label className="field-label">Name</label>
                <input className="field-input" {...r('name')} placeholder="Your name" />
                {(errors as any).name && (
                  <p className="mt-1 text-xs" style={{ color: 'hsl(var(--urgent))' }}>
                    {(errors as any).name.message}
                  </p>
                )}
              </div>
            )}

            <div className="field">
              <label className="field-label">Email</label>
              <input
                className="field-input"
                type="email"
                {...r('email')}
                placeholder="you@company.com"
              />
              {(errors as any).email && (
                <p className="mt-1 text-xs" style={{ color: 'hsl(var(--urgent))' }}>
                  {(errors as any).email.message}
                </p>
              )}
            </div>

            <div className="field">
              <label className="field-label">Password</label>
              <input
                className="field-input"
                type="password"
                {...r('password')}
                placeholder="••••••••"
              />
              {(errors as any).password && (
                <p className="mt-1 text-xs" style={{ color: 'hsl(var(--urgent))' }}>
                  {(errors as any).password.message}
                </p>
              )}
            </div>

            {(errors as any).root && (
              <p className="text-sm" style={{ color: 'hsl(var(--urgent))' }}>
                {(errors as any).root.message}
              </p>
            )}

            <button type="submit" className="btn-primary mt-2 w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Please wait...' : isSignin ? 'Sign in' : 'Create account'}
            </button>

            <div
              className="mt-5 text-center text-sm"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {isSignin ? (
                <>
                  No account?{' '}
                  <button
                    type="button"
                    className="cursor-pointer font-medium"
                    style={{ color: 'hsl(var(--primary))' }}
                    onClick={switchMode}
                  >
                    Request access
                  </button>
                </>
              ) : (
                <>
                  Already have one?{' '}
                  <button
                    type="button"
                    className="cursor-pointer font-medium"
                    style={{ color: 'hsl(var(--primary))' }}
                    onClick={switchMode}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
