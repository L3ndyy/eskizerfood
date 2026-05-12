'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getDishImageUrl } from '@/lib/dish-images';
import { Button } from '@/components/ui/button';
import { RestaurantCard } from '@/components/restaurant-card';
import { RestaurantCardSkeleton } from '@/components/restaurant-card-skeleton';
import { getRestaurants, getDishesByIds } from '@/app/actions/restaurants';
import { useFavoritesStore } from '@/store/favorites-store';
import type { RestaurantWithDishes, DishWithRestaurant } from '@/app/actions/restaurants';

export default function FavoritesPage() {
  const [restaurants, setRestaurants] = useState<RestaurantWithDishes[]>([]);
  const [dishes, setDishes] = useState<DishWithRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantIds = useFavoritesStore((s) => s.restaurantIds);
  const dishIds = useFavoritesStore((s) => s.dishIds);
  const toggleDish = useFavoritesStore((s) => s.toggleDish);
  const isDishFavorite = useFavoritesStore((s) => s.isDishFavorite);

  const restaurantIdsKey = useMemo(() => restaurantIds.join(','), [restaurantIds]);
  const dishIdsKey = useMemo(() => dishIds.join(','), [dishIds]);

  useEffect(() => {
    async function load() {
      const [allRestaurants, favDishes] = await Promise.all([
        getRestaurants({}).then((all) =>
          all.filter((r) => restaurantIds.includes(r.id))
        ),
        getDishesByIds(dishIds),
      ]);
      setRestaurants(allRestaurants);
      setDishes(favDishes);
      setLoading(false);
    }
    void load();
  }, [restaurantIdsKey, dishIdsKey, restaurantIds, dishIds]);

  const isEmpty = restaurants.length === 0 && dishes.length === 0;

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <h1 className="mb-6 font-display text-2xl font-bold tracking-tight">Избранное</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Нет избранного</h2>
        <p className="mt-2 text-muted-foreground">
          Добавляйте рестораны и блюда в избранное, нажимая на сердечко
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Найти рестораны</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight">Избранное</h1>

      {restaurants.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Рестораны</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} index={i} />
            ))}
          </div>
        </section>
      )}

      {dishes.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Блюда</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dishes.map((d) => (
              <Link
                key={d.id}
                href={`/restaurant/${d.restaurant.slug}#${d.id}`}
                className="group flex gap-3 rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-md"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={getDishImageUrl(d.image, d.category?.slug)}
                    alt={d.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium group-hover:text-primary">{d.name}</h3>
                  <p className="text-sm text-muted-foreground">{d.restaurant.name}</p>
                  <p className="mt-1 text-sm font-semibold text-primary">
                    {formatPrice(d.price)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDish(d.id);
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${isDishFavorite(d.id) ? 'fill-primary text-primary' : ''}`}
                  />
                </Button>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
