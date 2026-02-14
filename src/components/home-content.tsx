'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RestaurantCard } from '@/components/restaurant-card';
import { RestaurantCardSkeleton } from '@/components/restaurant-card-skeleton';
import { getRestaurants } from '@/app/actions/restaurants';
import type { RestaurantWithDishes } from '@/app/actions/restaurants';

const useStaticData = process.env.NEXT_PUBLIC_USE_STATIC_DATA === 'true';

function filterAndSort(
  list: RestaurantWithDishes[],
  opts: { search?: string; cuisine?: string; sort?: 'rating' | 'deliveryTime' | 'minOrder' }
) {
  let filtered = list;
  if (opts.search) {
    const q = opts.search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (Array.isArray(r.cuisineTypes) ? r.cuisineTypes.join(' ').toLowerCase().includes(q) : false)
    );
  }
  if (opts.cuisine) {
    const c = opts.cuisine.toLowerCase();
    filtered = filtered.filter((r) =>
      Array.isArray(r.cuisineTypes)
        ? r.cuisineTypes.some((t) => t.toLowerCase().includes(c))
        : false
    );
  }
  if (opts.sort === 'deliveryTime') filtered = [...filtered].sort((a, b) => a.deliveryTime - b.deliveryTime);
  else if (opts.sort === 'minOrder') filtered = [...filtered].sort((a, b) => a.minOrder - b.minOrder);
  else filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  return filtered;
}

export function HomeContent() {
  const [restaurants, setRestaurants] = useState<RestaurantWithDishes[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [sort, setSort] = useState<'rating' | 'deliveryTime' | 'minOrder'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const loadRestaurants = async () => {
    setLoading(true);
    if (useStaticData) {
      try {
        const base = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_BASE_PATH || '') : (process.env.BASE_PATH || '');
        const res = await fetch(`${base}/data/restaurants.json`);
        const data = (await res.json()) as RestaurantWithDishes[];
        setRestaurants(filterAndSort(data, { search: search || undefined, cuisine: cuisine || undefined, sort }));
      } catch {
        setRestaurants([]);
      }
      setLoading(false);
      return;
    }
    const data = await getRestaurants({ search: search || undefined, cuisine: cuisine || undefined, sort });
    setRestaurants(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRestaurants();
  }, [cuisine, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadRestaurants();
  };

  const handleRandomizer = () => {
    if (restaurants.length === 0) return;
    const random = restaurants[Math.floor(Math.random() * restaurants.length)];
    window.location.href = `/restaurant/${random.slug}`;
  };

  return (
    <div className="space-y-8">
      {/* Hero + Search */}
      <section className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Доставка еды из лучших ресторанов
          </h1>
          <p className="mt-2 text-muted-foreground">
            Закажите любимые блюда с доставкой на дом
          </p>
        </div>

        <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск ресторанов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Найти</Button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Фильтры
          </Button>
          <Button variant="outline" size="sm" onClick={handleRandomizer}>
            <Shuffle className="mr-2 h-4 w-4" />
            Что поесть?
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-muted/50 p-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Кухня</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Все</option>
                <option value="Пицца">Пицца</option>
                <option value="Суши">Суши</option>
                <option value="Бургеры">Бургеры</option>
                <option value="Итальянская">Итальянская</option>
                <option value="Десерты">Десерты</option>
                <option value="Фастфуд">Фастфуд</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Сортировка</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="rating">По рейтингу</option>
                <option value="deliveryTime">По времени доставки</option>
                <option value="minOrder">По мин. заказу</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Popular nearby */}
      {restaurants.length > 0 && !search && !cuisine && (
        <section>
          <h2 className="mb-6 text-xl font-semibold">Популярное рядом</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {restaurants
              .slice(0, 4)
              .map((r, i) => (
                <RestaurantCard key={r.id} restaurant={r} index={i} />
              ))}
          </div>
        </section>
      )}

      {/* Restaurants grid */}
      <section>
        <h2 className="mb-6 text-xl font-semibold">Рестораны</h2>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            Рестораны не найдены. Попробуйте изменить параметры поиска.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
