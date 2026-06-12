'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type RestaurantOption = {
  id: string;
  name: string;
  slug: string;
  image: string;
};

export default function GroupOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('restaurantId') ?? '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/register?callbackUrl=/group-order');
    }
  }, [status, router]);

  useEffect(() => {
    fetch('/api/restaurants')
      .then((res) => (res.ok ? res.json() : []))
      .then(setRestaurants)
      .catch(() => {});
  }, []);

  async function createSession() {
    if (!selectedId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/group-order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка создания');
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
              Соберите коллег или друзей в один заказ из одного ресторана
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block text-sm font-medium">Выберите ресторан</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          >
            <option value="">—</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>

          <Button className="w-full" size="lg" onClick={createSession} disabled={!selectedId || loading}>
            {loading ? 'Создание...' : 'Создать групповой заказ'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

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
