'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useMounted } from '@/hooks/use-mounted';
import { motion } from 'framer-motion';
import { Heart, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { Button } from '@/components/ui/button';

type Restaurant = Awaited<ReturnType<typeof import('@/app/actions/restaurants').getRestaurantBySlug>>;

import { getDishImageUrl } from '@/lib/dish-images';

interface RestaurantMenuProps {
  restaurant: NonNullable<Restaurant>;
}

export function RestaurantMenu({ restaurant }: RestaurantMenuProps) {
  const searchParams = useSearchParams();
  const groupToken = searchParams.get('groupToken');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    restaurant.dishes[0]?.categoryId ?? null
  );
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const restaurantId = useCartStore((s) => s.restaurantId);
  const mounted = useMounted();
  const isRestaurantFavorite = useFavoritesStore((s) => s.isFavorite(restaurant.id));
  const toggleRestaurantFavorite = useFavoritesStore((s) => s.toggle);
  const isDishFavorite = useFavoritesStore((s) => s.isDishFavorite);
  const toggleDishFavorite = useFavoritesStore((s) => s.toggleDish);

  const categories = Array.from(
    new Map(
      restaurant.dishes.map((d) => [d.categoryId, d.category])
    ).values()
  );

  const dishesByCategory = restaurant.dishes.reduce<Record<string, typeof restaurant.dishes>>(
    (acc, dish) => {
      if (!acc[dish.categoryId]) acc[dish.categoryId] = [];
      acc[dish.categoryId].push(dish);
      return acc;
    },
    {}
  );

  const getQuantity = (dishId: string) =>
    items.find((i) => i.dishId === dishId)?.quantity ?? 0;

  const scrollToCategory = (catId: string) => {
    setSelectedCategory(catId);
    const el = document.getElementById(catId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  async function addGroupItem(dish: (typeof restaurant.dishes)[number]) {
    if (!groupToken) return;
    await fetch(`/api/group-order/${groupToken}/add-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dishId: dish.id, quantity: 1 }),
    });
    alert('Блюдо добавлено в групповую корзину');
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="lg:w-48 shrink-0">
        <div className="sticky top-24 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => scrollToCategory(cat.id)}
              className={`block w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Меню</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleRestaurantFavorite(restaurant.id)}
          >
            <Heart
              className={`h-5 w-5 ${mounted && isRestaurantFavorite ? 'fill-primary text-primary' : ''}`}
            />
          </Button>
        </div>

        {categories.map((cat) => (
          <div
            key={cat.id}
            id={cat.id}
            className="mb-12 scroll-mt-32"
          >
            <h3 className="mb-4 text-lg font-semibold">{cat.name}</h3>
            <div className="space-y-6">
              {dishesByCategory[cat.id]?.map((dish) => {
                const qty = groupToken ? 0 : getQuantity(dish.id);
                return (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-4 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={getDishImageUrl(
                          dish.image,
                          dish.category?.slug
                        )}
                        alt={dish.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium">{dish.name}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => toggleDishFavorite(dish.id)}
                        >
                          <Heart
                            className={`h-4 w-4 ${mounted && isDishFavorite(dish.id) ? 'fill-primary text-primary' : ''}`}
                          />
                        </Button>
                      </div>
                      {dish.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {dish.description}
                        </p>
                      )}
                      {dish.weight && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {dish.weight}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-semibold text-primary">
                          {formatPrice(dish.price)}
                        </span>
                        {qty > 0 && !groupToken ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(dish.id, qty - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-6 text-center font-medium">{qty}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(dish.id, qty + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() =>
                              groupToken
                                ? addGroupItem(dish)
                                : addItem({
                                    dishId: dish.id,
                                    dishName: dish.name,
                                    price: dish.price,
                                    quantity: 1,
                                    image: dish.image ?? undefined,
                                    restaurantId: restaurant.id,
                                    restaurantName: restaurant.name,
                                  })
                            }
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            {groupToken ? 'В группу' : 'В корзину'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
