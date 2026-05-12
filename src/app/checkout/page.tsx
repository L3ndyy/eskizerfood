'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/phone-input';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, restaurantId, getTotal, clearCart } = useCartStore();
  const restaurantName = items[0]?.restaurantName ?? '';
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const total = getTotal();

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex max-w-2xl items-center justify-center px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId || items.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          address,
          phone,
          comment: comment || undefined,
          items: items.map((i) => ({
            dishId: i.dishId,
            quantity: i.quantity,
            price: i.price,
          })),
          total,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Ошибка создания заказа');

      clearCart();
      router.push(`/orders/${data.orderId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка оформления заказа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Оформление заказа</h1>
      <p className="mt-2 text-muted-foreground">{restaurantName}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium">
            Адрес доставки
          </label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="ул. Примерная, д. 1, кв. 1"
            required
            className="mt-2"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Телефон
          </label>
          <PhoneInput
            id="phone"
            value={phone}
            onChange={setPhone}
            required
            className="mt-2"
          />
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium">
            Комментарий к заказу (необязательно)
          </label>
          <Input
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Домофон 123"
            className="mt-2"
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold">Состав заказа</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {items.map((i) => (
              <li key={i.dishId}>
                {i.dishName} × {i.quantity} — {formatPrice(i.price * i.quantity)}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg font-semibold">
            Итого: {formatPrice(total)}
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/cart">Назад</Link>
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Оформление...' : 'Оформить заказ'}
          </Button>
        </div>
      </form>
    </div>
  );
}
