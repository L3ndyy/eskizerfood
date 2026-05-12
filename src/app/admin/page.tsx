import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { UtensilsCrossed, ShoppingBag, Users, MessageCircle } from 'lucide-react';

export default async function AdminPage() {
  const [restaurantsCount, ordersCount, usersCount] = await Promise.all([
    prisma.restaurant.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Панель управления</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/restaurants"
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Рестораны</p>
            <p className="text-2xl font-bold">{restaurantsCount}</p>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Заказы</p>
            <p className="text-2xl font-bold">{ordersCount}</p>
          </div>
        </Link>

        <Link
          href="/admin/support"
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Поддержка</p>
            <p className="text-sm text-muted-foreground">Ответы клиентам</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Пользователи</p>
            <p className="text-2xl font-bold">{usersCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
