import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { Star } from 'lucide-react';

export default async function AdminRestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { dishes: true } } },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Рестораны</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((r) => (
          <div
            key={r.id}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="relative aspect-video overflow-hidden bg-muted">
              <Image
                src={r.image}
                alt={r.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{r.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {r.rating} • {r._count.dishes} блюд
              </p>
              <p className="mt-2 text-sm">
                Мин. заказ: {formatPrice(r.minOrder)} • Доставка: {formatPrice(r.deliveryFee)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
