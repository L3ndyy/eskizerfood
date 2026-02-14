'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Clock, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useFavoritesStore } from '@/store/favorites-store';
import { useMounted } from '@/hooks/use-mounted';
import type { RestaurantWithDishes } from '@/app/actions/restaurants';

interface RestaurantCardProps {
  restaurant: RestaurantWithDishes;
  index?: number;
}

export function RestaurantCard({ restaurant, index = 0 }: RestaurantCardProps) {
  const mounted = useMounted();
  const isFavorite = useFavoritesStore((s) => s.isFavorite(restaurant.id));
  const toggle = useFavoritesStore((s) => s.toggle);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/restaurant/${restaurant.slug}`}
        className="group block overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggle(restaurant.id);
            }}
            className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background"
          >
            <Heart
              className={`h-5 w-5 ${mounted && isFavorite ? 'fill-primary text-primary' : ''}`}
            />
          </button>
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1 text-sm font-medium backdrop-blur">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {restaurant.rating}
            <span className="text-muted-foreground">
              ({restaurant.reviewCount})
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold group-hover:text-primary">{restaurant.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {restaurant.cuisineTypes?.join(' • ')}
          </p>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {restaurant.deliveryTime} мин
            </span>
            <span>{formatPrice(restaurant.deliveryFee)} доставка</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
