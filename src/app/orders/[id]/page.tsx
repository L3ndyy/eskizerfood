import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { OrderStatusTracker } from '@/components/order-status-tracker';
import { OrderStatusSimulator } from '@/components/order-status-simulator';

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      restaurant: true,
      items: { include: { dish: true } },
    },
  });

  if (!order) notFound();

  const statusLabels: Record<string, string> = {
    PENDING: 'Ожидает подтверждения',
    CONFIRMED: 'Подтверждён',
    PREPARING: 'Готовится',
    DELIVERING: 'В пути',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменён',
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Заказ #{order.id.slice(-6)}</h1>
      <p className="mt-2 text-muted-foreground">
        {order.restaurant.name} • {new Date(order.createdAt).toLocaleDateString('ru-RU')}
      </p>

      <OrderStatusSimulator orderId={order.id} status={order.status} />
      <div className="mt-8">
        <OrderStatusTracker status={order.status} deliveryTime={order.deliveryTime} />
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold">Состав заказа</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.dish.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-lg font-semibold">
          Итого: {formatPrice(order.total)}
        </p>
      </div>

      <div className="mt-6 space-y-2 text-sm text-muted-foreground">
        <p>Адрес: {order.address}</p>
        <p>Телефон: {order.phone}</p>
        {order.comment && <p>Комментарий: {order.comment}</p>}
      </div>

      <Button asChild className="mt-8">
        <Link href="/">На главную</Link>
      </Button>
    </div>
  );
}
