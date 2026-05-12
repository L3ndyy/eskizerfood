'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, getTotal } = useCartStore();

  const restaurantNameFromItems = items[0]?.restaurantName;

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
      <p className="mt-2 text-muted-foreground">{restaurantNameFromItems}</p>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-6 text-center font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-right font-semibold">
              {formatPrice(item.price * item.quantity)}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <div className="flex justify-between text-lg font-semibold">
          <span>Итого</span>
          <span>{formatPrice(total)}</span>
        </div>
        <Button asChild className="mt-4 w-full" size="lg">
          <Link href="/checkout">Оформить заказ</Link>
        </Button>
      </div>
    </div>
  );
}
