'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Copy, Users, Clock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { saveCheckoutDraft } from '@/lib/checkout-draft';

type GroupSessionData = {
  id: string;
  token: string;
  status: string;
  expiresAt: string;
  restaurant: {
    id: string;
    name: string;
    slug: string;
    deliveryFee: number;
    minOrder: number;
  };
  initiator: { id: string; name: string | null; email: string | null };
  participants: Array<{ userId: string; displayName: string; hasPaid: boolean }>;
  cartItems: Array<{
    id: string;
    userId: string;
    userName: string;
    dishName: string;
    price: number;
    quantity: number;
  }>;
  total: number;
};

function GroupJoinContent() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [copied, setCopied] = useState(false);
  const token = params.token;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/auth/register?callbackUrl=/group-order/join/${token}`);
    }
  }, [status, router, token]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch(`/api/group-order/${token}/join`, { method: 'POST' }).catch(() => {});
  }, [status, token]);

  const { data, refetch, isLoading } = useQuery<GroupSessionData>({
    queryKey: ['group-order', token],
    queryFn: async () => {
      const res = await fetch(`/api/group-order/${token}`);
      if (!res.ok) throw new Error('Session not found');
      return res.json();
    },
    enabled: status === 'authenticated',
    refetchInterval: 3000,
  });

  const isInitiator = data?.initiator.id === session?.user?.id;
  const joinUrl = useMemo(
    () => (typeof window !== 'undefined' ? `${window.location.origin}/group-order/join/${token}` : ''),
    [token]
  );

  async function copyLink() {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function removeItem(itemId: string) {
    await fetch(`/api/group-order/${token}/remove-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    refetch();
  }

  async function finalize(paymentMode: 'CENTRALIZED' | 'SPLIT') {
    const res = await fetch(`/api/group-order/${token}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMode }),
    });
    const result = await res.json();
    if (!res.ok) {
      alert(result.error || 'Ошибка');
      return;
    }

    saveCheckoutDraft({
      restaurantId: data!.restaurant.id,
      address: 'Групповой заказ',
      phone: '',
      groupToken: token,
      split: paymentMode === 'SPLIT',
    });

    router.push(result.redirectUrl);
  }

  if (status === 'loading' || isLoading || !data) {
    return (
      <div className="container mx-auto flex max-w-3xl items-center justify-center px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const expiresIn = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 60000));

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-primary">Групповой заказ</p>
            <h1 className="mt-1 text-2xl font-bold">{data.restaurant.name}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              До закрытия: {expiresIn} мин • Статус: {data.status}
            </p>
          </div>
          <Button variant="outline" onClick={copyLink}>
            <Copy className="mr-2 h-4 w-4" />
            {copied ? 'Скопировано' : 'Ссылка-приглашение'}
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {data.participants.map((participant) => (
            <span
              key={participant.userId}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
            >
              <Users className="h-3 w-3" />
              {participant.displayName}
              {participant.hasPaid && ' ✓'}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Общая корзина</h2>
            <Button asChild variant="outline" size="sm">
              <Link href={`/restaurant/${data.restaurant.slug}?groupToken=${token}`}>
                Добавить блюда
              </Link>
            </Button>
          </div>

          {data.cartItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              <ShoppingBag className="mx-auto mb-3 h-8 w-8" />
              Пока никто не добавил блюда
            </div>
          ) : (
            <ul className="space-y-3">
              {data.cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {item.dishName} × {item.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.userName} • {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                  {(item.userId === session?.user?.id || isInitiator) && data.status === 'ACTIVE' && (
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                      Удалить
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-lg font-semibold">Итого</span>
            <span className="text-xl font-bold">{formatPrice(data.total + data.restaurant.deliveryFee)}</span>
          </div>
        </div>

        {isInitiator && data.status === 'ACTIVE' && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() => finalize('CENTRALIZED')}
              disabled={data.cartItems.length === 0}
            >
              Оплатить централизованно
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => finalize('SPLIT')}
              disabled={data.cartItems.length === 0}
            >
              Раздельная оплата
            </Button>
          </div>
        )}

        {!isInitiator && data.status === 'CLOSED' && (
          <div className="mt-8">
            <Button asChild className="w-full">
              <Link href={`/payment?groupToken=${token}&split=true`}>Оплатить свою часть</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GroupJoinPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex max-w-3xl items-center justify-center px-4 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <GroupJoinContent />
    </Suspense>
  );
}
