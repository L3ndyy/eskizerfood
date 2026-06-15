'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { parseJsonResponse } from '@/lib/fetch-json';
import { setStoredGroupOrderToken } from '@/lib/group-order-storage';

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const [groupLoading, setGroupLoading] = useState(false);

  const restaurantNames = [...new Set(items.map((i) => i.restaurantName))];
  const itemsByRestaurant = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.restaurantId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  function handleCheckout() {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/register?callbackUrl=/checkout');
      return;
    }
    router.push('/checkout');
  }

  async function createGroupOrder() {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/register?callbackUrl=/cart');
      return;
    }

    setGroupLoading(true);
    try {
      const res = await fetch('/api/group-order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items.map((item) => ({
            dishId: item.dishId,
            quantity: item.quantity,
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
          })),
        }),
      });

      const data = await parseJsonResponse<{
        joinUrl?: string;
        token?: string;
        expiresAt?: string;
        error?: string;
      }>(res);
      if (!res.ok || !data?.joinUrl) {
        throw new Error(data?.error || 'Не удалось создать групповой заказ');
      }

      const token = data.token ?? data.joinUrl.split('/').pop() ?? '';
      setStoredGroupOrderToken(token, data.expiresAt);
      clearCart();
      router.push(data.joinUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setGroupLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Корзина пуста</h2>
        <p className="mt-2 text-muted-foreground">
          Добавьте блюда из ресторанов, чтобы оформить заказ
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Выбрать ресторан</Link>
        </Button>
      </div>
    );
  }

  const total = getTotal();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Корзина</h1>
      <p className="mt-2 text-muted-foreground">
        {restaurantNames.length > 1
          ? `${restaurantNames.length} ресторана`
          : restaurantNames[0]}
      </p>

      <div className="mt-8 space-y-8">
        {Object.entries(itemsByRestaurant).map(([restaurantId, restaurantItems]) => (
          <div key={restaurantId}>
            <h2 className="mb-3 font-semibold text-primary">
              {restaurantItems[0]?.restaurantName}
            </h2>
            <div className="space-y-4">
              {restaurantItems.map((item) => (
                <motion.div
                  key={item.dishId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.dishName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        —
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">{item.dishName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                        aria-label="Уменьшить количество"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                        aria-label="Увеличить количество"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.dishId)}
                        aria-label="Удалить из корзины"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="font-semibold">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <div className="flex justify-between text-lg font-semibold">
          <span>Итого</span>
          <span>{formatPrice(total)}</span>
        </div>

        {restaurantNames.length > 1 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Доставка считается отдельно для каждого ресторана
          </p>
        )}

        <Button
          className="mt-4 w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={status === 'loading' || restaurantNames.length > 1}
        >
          {restaurantNames.length > 1 ? 'Оформить по одному ресторану' : 'Оформить заказ'}
        </Button>

        {restaurantNames.length > 1 && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Для заказа из нескольких ресторанов используйте групповой заказ
          </p>
        )}

        <Button
          variant="outline"
          className="mt-3 w-full"
          size="lg"
          onClick={createGroupOrder}
          disabled={groupLoading || status === 'loading'}
        >
          <Users className="mr-2 h-4 w-4" />
          {groupLoading ? 'Создание...' : 'Групповой заказ — пригласить друзей'}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Друзья смогут добавлять блюда из любых ресторанов по вашей ссылке
        </p>
      </div>
    </div>
  );
}
