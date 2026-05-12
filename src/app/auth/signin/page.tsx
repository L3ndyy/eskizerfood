'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function SignInForm() {
  const searchParams = useSearchParams();
  const [csrfToken, setCsrfToken] = useState<string>('');
  const registeredEmail = useMemo(
    () =>
      searchParams.get('registered') === '1' ? (searchParams.get('email') ?? '') : '',
    [searchParams]
  );
  const urlError = useMemo(
    () =>
      searchParams.get('error') === 'CredentialsSignin'
        ? 'Неверный email или пароль'
        : null,
    [searchParams]
  );

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken ?? ''));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-2xl border border-border/80 bg-card/70 p-8 shadow-xl shadow-black/[0.04] backdrop-blur-sm dark:shadow-black/30"
      >
        <div className="text-center">
          <Link href="/" className="font-display text-3xl font-semibold tracking-tight text-primary">
            FoodExpress
          </Link>
          <h1 className="mt-6 text-xl font-semibold tracking-tight">Вход в аккаунт</h1>
          <p className="mt-2 text-muted-foreground">
            Войдите, чтобы оформить заказ и получать бонусы
          </p>
        </div>

        <form
          method="post"
          action="/api/auth/callback/credentials"
          className="space-y-4 pt-2"
        >
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="callbackUrl" value="/" />

          {registeredEmail && (
            <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
              Регистрация успешна! Войдите в аккаунт.
            </div>
          )}
          {urlError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {urlError}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              defaultValue={registeredEmail}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Пароль
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full">
            Войти
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Нет аккаунта?{' '}
          <Link href="/auth/register" className="font-medium text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
