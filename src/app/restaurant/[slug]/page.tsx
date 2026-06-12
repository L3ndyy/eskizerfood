import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star, Clock, MapPin, ArrowLeft, Users } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getRestaurantBySlug } from '@/app/actions/restaurants';
import { RestaurantMenu } from '@/components/restaurant-menu';
import { Button } from '@/components/ui/button';

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return (
    <div>
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted">
        <Image
          src={restaurant.coverImage || restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white md:p-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-white/90 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Link>
          <h1 className="text-2xl font-bold md:text-3xl">{restaurant.name}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/90">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {restaurant.rating} ({restaurant.reviewCount})
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {restaurant.deliveryTime} мин
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {restaurant.address}
            </span>
          </div>
          <p className="mt-2 text-sm text-white/80">{restaurant.description}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <span>Мин. заказ: {formatPrice(restaurant.minOrder)}</span>
            <span>Доставка: {formatPrice(restaurant.deliveryFee)}</span>
          </div>
          <Button asChild size="sm" className="mt-4">
            <Link href={`/group-order?restaurantId=${restaurant.id}`}>
              <Users className="mr-2 h-4 w-4" />
              Групповой заказ
            </Link>
          </Button>
        </div>
      </div>

      <div className="container px-4 py-8">
        <Suspense fallback={<div className="py-8 text-center">Загрузка меню...</div>}>
          <RestaurantMenu restaurant={restaurant} />
        </Suspense>
      </div>
    </div>
  );
}
