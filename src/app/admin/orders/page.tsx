import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { AdminOrderStatus } from '@/components/admin-order-status';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      restaurant: true,
      user: { select: { name: true, email: true } },
      items: { include: { dish: true } },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Заказы</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-left font-medium">ID</th>
              <th className="p-4 text-left font-medium">Ресторан</th>
              <th className="p-4 text-left font-medium">Клиент</th>
              <th className="p-4 text-left font-medium">Состав</th>
              <th className="p-4 text-left font-medium">Сумма</th>
              <th className="p-4 text-left font-medium">Статус</th>
              <th className="p-4 text-left font-medium">Дата</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border">
                <td className="p-4 font-mono text-xs">{order.id.slice(-8)}</td>
                <td className="p-4">{order.restaurant.name}</td>
                <td className="p-4">
                  {order.user.name || order.user.email}
                </td>
                <td className="max-w-xs p-4 text-muted-foreground">
                  {order.items
                    .map((item) => `${item.dish.name} × ${item.quantity}`)
                    .join(', ')}
                </td>
                <td className="p-4">{formatPrice(order.total)}</td>
                <td className="p-4">
                  <AdminOrderStatus orderId={order.id} currentStatus={order.status} />
                </td>
                <td className="p-4 text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
