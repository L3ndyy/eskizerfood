'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseJsonResponse } from '@/lib/fetch-json';
import {
  clearStoredGroupOrderToken,
  getStoredGroupOrderToken,
  setStoredGroupOrderToken,
} from '@/lib/group-order-storage';

export default function GroupOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeToken, setActiveToken] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/register?callbackUrl=/group-order');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const saved = getStoredGroupOrderToken();
    if (!saved) {
      setChecking(false);
      return;
    }

    fetch(`/api/group-order/${saved}`)
      .then(async (res) => {
        const data = await parseJsonResponse<{ status?: string }>(res);
        if (res.ok && data?.status === 'ACTIVE') {
          setActiveToken(saved);
          if (!searchParams.get('new')) {
            router.replace(`/group-order/join/${saved}`);
          }
        } else {
          clearStoredGroupOrderToken();
        }
      })
      .catch(() => clearStoredGroupOrderToken())
      .finally(() => setChecking(false));
  }, [status, router, searchParams]);

  async function createSession() {
    setLoading(true);
    try {
      clearStoredGroupOrderToken();
      const restaurantId = searchParams.get('restaurantId');
      const res = await fetch('/api/group-order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurantId ? { restaurantId } : {}),
      });
      const data = await parseJsonResponse<{
        joinUrl?: string;
        token?: string;
        expiresAt?: string;
        error?: string;
        detail?: string;
      }>(res);
      if (!res.ok || !data?.joinUrl) {
        const extra = data?.detail ? `\n\n${data.detail}` : '';
        throw new Error((data?.error || 'Ошибка создания') + extra);
      }
      const token = data.token ?? data.joinUrl.split('/').pop() ?? '';
      setStoredGroupOrderToken(token, data.expiresAt);
      router.push(data.joinUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || checking) {
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
          {activeToken ? (
            <Button className="w-full" size="lg" asChild>
              <Link href={`/group-order/join/${activeToken}`}>
                Продолжить текущий заказ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}

          <Button
            className="w-full"
            size="lg"
            variant={activeToken ? 'outline' : 'default'}
            onClick={createSession}
            disabled={loading}
          >
            {loading ? 'Создание...' : activeToken ? 'Создать новый заказ' : 'Создать групповой заказ'}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
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
        </div>
      </div>
    </div>
  );
}
