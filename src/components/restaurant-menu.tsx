'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useMounted } from '@/hooks/use-mounted';
import { motion } from 'framer-motion';
import { Heart, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useFavoritesStore } from '@/store/favorites-store';
import { useGroupOrderToken } from '@/hooks/use-group-order-token';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { parseJsonResponse } from '@/lib/fetch-json';

type Restaurant = Awaited<ReturnType<typeof import('@/app/actions/restaurants').getRestaurantBySlug>>;

import { getDishImageUrl } from '@/lib/dish-images';

interface RestaurantMenuProps {
  restaurant: NonNullable<Restaurant>;
}

export function RestaurantMenu({ restaurant }: RestaurantMenuProps) {
  const groupToken = useGroupOrderToken();
  const { data: session } = useSession();
  const [groupQty, setGroupQty] = useState<Record<string, number>>({});
  const [groupItemIds, setGroupItemIds] = useState<Record<string, string>>({});
  const [addingDishId, setAddingDishId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    restaurant.dishes[0]?.categoryId ?? null
  );

  const syncGroupCart = useCallback(async () => {
    if (!groupToken || !session?.user?.id) return;
    const res = await fetch(`/api/group-order/${groupToken}`);
    const data = await parseJsonResponse<{
      cartItems: Array<{ id: string; dishId: string; quantity: number; userId: string }>;
    }>(res);
    if (!res.ok || !data?.cartItems) return;

    const qty: Record<string, number> = {};
    const ids: Record<string, string> = {};
    for (const item of data.cartItems) {
      if (item.userId !== session.user.id) continue;
      qty[item.dishId] = (qty[item.dishId] ?? 0) + item.quantity;
      ids[item.dishId] = item.id;
    }
    setGroupQty(qty);
    setGroupItemIds(ids);
  }, [groupToken, session?.user?.id]);

  useEffect(() => {
    void syncGroupCart();
  }, [syncGroupCart]);
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

  async function changeGroupItem(
    dish: (typeof restaurant.dishes)[number],
    delta: 1 | -1
  ) {
    if (!groupToken) return;
    setAddingDishId(dish.id);
    try {
      if (delta === 1) {
        const res = await fetch(`/api/group-order/${groupToken}/add-item`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dishId: dish.id, quantity: 1 }),
        });
        const data = await parseJsonResponse<{ error?: string }>(res);
        if (!res.ok) throw new Error(data?.error || 'Не удалось добавить');
      } else {
        const itemId = groupItemIds[dish.id];
        if (!itemId) return;
        const res = await fetch(`/api/group-order/${groupToken}/update-item`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, delta: -1 }),
        });
        const data = await parseJsonResponse<{ error?: string }>(res);
        if (!res.ok) throw new Error(data?.error || 'Не удалось изменить');
      }
      await syncGroupCart();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setAddingDishId(null);
    }
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
          <div className="flex items-center gap-2">
            {groupToken ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`/group-order/join/${groupToken}`}>К групповой корзине</a>
              </Button>
            ) : null}
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
                const qty = groupToken ? (groupQty[dish.id] ?? 0) : getQuantity(dish.id);
                const isAdding = addingDishId === dish.id;
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
                        {qty > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isAdding}
                              onClick={() =>
                                groupToken
                                  ? void changeGroupItem(dish, -1)
                                  : updateQuantity(dish.id, qty - 1)
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-6 text-center font-medium">{qty}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isAdding}
                              onClick={() =>
                                groupToken
                                  ? void changeGroupItem(dish, 1)
                                  : updateQuantity(dish.id, qty + 1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            disabled={isAdding}
                            onClick={() =>
                              groupToken
                                ? void changeGroupItem(dish, 1)
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
