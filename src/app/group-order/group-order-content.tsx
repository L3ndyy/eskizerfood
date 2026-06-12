'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseJsonResponse } from '@/lib/fetch-json';

export default function GroupOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/register?callbackUrl=/group-order');
    }
  }, [status, router]);

  async function createSession() {
    setLoading(true);
    try {
      const restaurantId = searchParams.get('restaurantId');
      const res = await fetch('/api/group-order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurantId ? { restaurantId } : {}),
      });
      const data = await parseJsonResponse<{ joinUrl?: string; error?: string }>(res);
      if (!res.ok || !data?.joinUrl) {
        throw new Error(data?.error || 'Ошибка создания');
      }
      sessionStorage.setItem('groupOrderToken', data.joinUrl.split('/').pop() ?? '');
      router.push(data.joinUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto flex max-w-2xl items-center justify-center px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Групповой заказ</h1>
            <p className="text-muted-foreground">
              Соберите друзей и закажите из нескольких ресторанов сразу
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <Button className="w-full" size="lg" onClick={createSession} disabled={loading}>
            {loading ? 'Создание...' : 'Создать групповой заказ'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Или добавьте блюда в{' '}
            <Link href="/cart" className="text-primary hover:underline">
              корзину
            </Link>{' '}
            и нажмите «Групповой заказ» там
          </p>

          <p className="text-center text-sm text-muted-foreground">
            После создания вы получите ссылку-приглашение для участников
          </p>
          <p className="text-center text-sm">
            <Link href="/" className="text-primary hover:underline">
              Вернуться на главную
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
