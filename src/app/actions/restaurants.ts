'use server';

import { prisma } from '@/lib/prisma';

export type RestaurantWithDishes = Awaited<ReturnType<typeof getRestaurants>>[number];

export async function getRestaurants(opts?: {
  search?: string;
  cuisine?: string;
  sort?: 'rating' | 'deliveryTime' | 'minOrder';
}) {
  const restaurants = await prisma.restaurant.findMany({
    where: { isActive: true },
    orderBy: { rating: 'desc' },
    include: {
      dishes: { take: 3, where: { isAvailable: true } },
    },
  });

  let filtered = restaurants;
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisineTypes?.toLowerCase().includes(q)
    );
  }
  if (opts?.cuisine) {
    filtered = filtered.filter((r) =>
      r.cuisineTypes?.toLowerCase().includes(opts!.cuisine!.toLowerCase())
    );
  }
  if (opts?.sort === 'deliveryTime') {
    filtered = [...filtered].sort((a, b) => a.deliveryTime - b.deliveryTime);
  } else if (opts?.sort === 'minOrder') {
    filtered = [...filtered].sort((a, b) => a.minOrder - b.minOrder);
  }

  return filtered.map((r) => ({
    ...r,
    cuisineTypes: ((): string[] => {
      try {
        return typeof r.cuisineTypes === 'string'
          ? (JSON.parse(r.cuisineTypes) as string[])
          : [];
      } catch {
        return [];
      }
    })(),
  }));
}

export async function getRestaurantBySlug(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug, isActive: true },
    include: {
      dishes: {
        where: { isAvailable: true },
        orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
        include: { category: true },
      },
    },
  });
  if (!restaurant) return null;
  return {
    ...restaurant,
    cuisineTypes: ((): string[] => {
      try {
        return typeof restaurant.cuisineTypes === 'string'
          ? (JSON.parse(restaurant.cuisineTypes) as string[])
          : [];
      } catch {
        return [];
      }
    })(),
  };
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
}

export type DishWithRestaurant = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  weight: string | null;
  image: string | null;
  restaurant: { id: string; name: string; slug: string };
  category?: { slug: string } | null;
};

export async function getDishesByIds(dishIds: string[]): Promise<DishWithRestaurant[]> {
  if (dishIds.length === 0) return [];
  const dishes = await prisma.dish.findMany({
    where: { id: { in: dishIds }, isAvailable: true },
    include: {
      restaurant: { select: { id: true, name: true, slug: true } },
      category: { select: { slug: true } },
    },
  });
  const order = new Map(dishIds.map((id, i) => [id, i]));
  return dishes.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
