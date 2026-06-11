import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { CreditCard, MapPin, ShoppingBag, Gift } from 'lucide-react';
import { AccountProfile } from '@/components/account-profile';
import { AccountCards } from '@/components/account-cards';
import { AccountAddresses } from '@/components/account-addresses';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  PREPARING: 'Готовится',
  DELIVERING: 'В пути',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const [orders, cards, addresses, user] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        restaurant: true,
        items: { include: { dish: true } },
      },
    }),
    prisma.paymentCard.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: 'desc' },
    }),
    prisma.userAddress.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, bonusPoints: true },
    }),
  ]);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Личный кабинет</h1>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Gift className="h-5 w-5 text-primary" />
            Профиль
          </h2>
          <AccountProfile user={user} />
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <CreditCard className="h-5 w-5 text-primary" />
            Привязанные карты
          </h2>
          <AccountCards cards={cards} />
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <MapPin className="h-5 w-5 text-primary" />
            Адреса доставки
          </h2>
          <AccountAddresses addresses={addresses} />
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <ShoppingBag className="h-5 w-5 text-primary" />
            История заказов
          </h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-2xl font-bold text-primary">
                {user?.bonusPoints ?? 0} ₽
              </p>
              <span className="text-sm text-muted-foreground">
                Бонусные баллы (1 балл = 1 ₽)
              </span>
            </div>
            {orders.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Заказов пока нет
              </p>
            ) : (
              <ul className="space-y-4">
                {orders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-start justify-between gap-4 rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{order.restaurant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}{' '}
                          • {formatPrice(order.total)}
                        </p>
                        <p className="mt-1 text-sm">
                          {order.items
                            .map((item) => `${item.dish.name} × ${item.quantity}`)
                            .join(', ')}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : order.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
