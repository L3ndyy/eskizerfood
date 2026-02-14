import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getRestaurantBySlug } from '@/app/actions/restaurants';
import type { getRestaurantBySlug as getRestaurantBySlugFn } from '@/app/actions/restaurants';
import { getStaticRestaurantBySlug, getStaticRestaurantSlugs } from '@/lib/static-restaurants';
import { RestaurantMenu } from '@/components/restaurant-menu';

type RestaurantForMenu = NonNullable<Awaited<ReturnType<typeof getRestaurantBySlugFn>>>;

const useStaticData = process.env.NEXT_PUBLIC_USE_STATIC_DATA === 'true';

export async function generateStaticParams() {
  if (!useStaticData) return [];
  return getStaticRestaurantSlugs().map((slug) => ({ slug }));
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = useStaticData
    ? await getStaticRestaurantBySlug(slug)
    : await getRestaurantBySlug(slug);
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
          <div className="mt-2 flex gap-4 text-sm">
            <span>Мин. заказ: {formatPrice(restaurant.minOrder)}</span>
            <span>Доставка: {formatPrice(restaurant.deliveryFee)}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl w-full px-4 py-8">
        <RestaurantMenu restaurant={restaurant as RestaurantForMenu} />
      </div>
    </div>
  );
}
