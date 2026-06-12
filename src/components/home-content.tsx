'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RestaurantCard } from '@/components/restaurant-card';
import { RestaurantCardSkeleton } from '@/components/restaurant-card-skeleton';
import { getRestaurants } from '@/app/actions/restaurants';
import type { RestaurantWithDishes } from '@/app/actions/restaurants';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export function HomeContent() {
  const searchParams = useSearchParams();
  const groupToken = searchParams.get('groupToken');
  const [restaurants, setRestaurants] = useState<RestaurantWithDishes[]>([]);
  const [banners, setBanners] = useState<Array<{ id: string; title: string; subtitle?: string | null; image: string; link?: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [sort, setSort] = useState<'rating' | 'deliveryTime' | 'minOrder'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    const data = await getRestaurants({ search: search || undefined, cuisine: cuisine || undefined, sort });
    setRestaurants(data);
    setLoading(false);
  }, [search, cuisine, sort]);

  useEffect(() => {
    fetch('/api/banners')
      .then((res) => (res.ok ? res.json() : []))
      .then(setBanners)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void loadRestaurants();
    });
    return () => cancelAnimationFrame(id);
  }, [loadRestaurants]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadRestaurants();
  };

  const handleRandomizer = () => {
    if (restaurants.length === 0) return;
    const random = restaurants[Math.floor(Math.random() * restaurants.length)];
    window.location.href = groupToken
      ? `/restaurant/${random.slug}?groupToken=${groupToken}`
      : `/restaurant/${random.slug}`;
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.04 } } }}
    >
      {groupToken && (
        <motion.div
          variants={item}
          className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm"
        >
          Групповой заказ — выберите ресторан и добавляйте блюда в общую корзину.{' '}
          <a href={`/group-order/join/${groupToken}`} className="font-medium text-primary hover:underline">
            Вернуться к корзине группы
          </a>
        </motion.div>
      )}
      {banners.length > 0 && (
        <motion.section variants={item} className="grid gap-4 md:grid-cols-2">
          {banners.map((banner) => (
            <a
              key={banner.id}
              href={banner.link || '#'}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div
                className="flex min-h-32 items-end bg-cover bg-center p-6 text-white"
                style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.65), transparent), url(${banner.image})` }}
              >
                <div>
                  <h2 className="text-xl font-semibold">{banner.title}</h2>
                  {banner.subtitle && (
                    <p className="mt-1 text-sm text-white/90">{banner.subtitle}</p>
                  )}
                </div>
              </div>
            </a>
          ))}
        </motion.section>
      )}

      {/* Hero + Search — компактный блок */}
      <motion.section
        className="space-y-4 max-w-3xl mx-auto"
        variants={item}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
            Доставка еды из лучших ресторанов
          </h1>
          <motion.p
            className="mt-2 text-muted-foreground text-sm md:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            Закажите любимые блюда с доставкой на дом
          </motion.p>
        </motion.div>

        <motion.form
          onSubmit={handleSearch}
          className="flex gap-2 rounded-2xl border border-border/80 bg-card/80 p-2 shadow-md shadow-black/[0.03] backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary/35 transition-all dark:shadow-black/20"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform duration-200 group-focus-within:scale-110" />
            <Input
              placeholder="Поиск ресторанов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button type="submit" size="sm" className="rounded-xl shrink-0 transition-transform active:scale-95">Найти</Button>
        </motion.form>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="transition-all duration-200 hover:scale-105 active:scale-95 rounded-full px-4"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Фильтры
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomizer}
            className="transition-all duration-200 hover:scale-105 active:scale-95 hover:border-primary/50 rounded-full px-4"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Что поесть?
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-wrap gap-4 rounded-xl border border-border bg-muted/50 p-4 overflow-hidden"
          >
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
          </motion.div>
        )}
        </AnimatePresence>
      </motion.section>

      {/* Popular nearby */}
      {restaurants.length > 0 && !search && !cuisine && (
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-primary" />
            Популярное рядом
          </h2>
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {restaurants.slice(0, 4).map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} index={i} groupToken={groupToken} />
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Restaurants grid */}
      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="h-1 w-8 rounded-full bg-primary" />
          Рестораны
        </h2>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <RestaurantCardSkeleton key={i} index={i} />
              ))}
            </motion.div>
          ) : restaurants.length === 0 ? (
            <motion.div
              key="empty"
              className="py-12 text-center text-muted-foreground rounded-xl border border-dashed border-border bg-muted/30"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Рестораны не найдены. Попробуйте изменить параметры поиска.
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {restaurants.map((r, i) => (
                <RestaurantCard key={r.id} restaurant={r} index={i} groupToken={groupToken} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </motion.div>
  );
}
