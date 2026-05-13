'use server';

import { prisma } from '@/lib/prisma';
import { resolveImageWithFallback } from '@/lib/server/public-image';

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

  return filtered.map((r) => {
    const restaurantImage = resolveImageWithFallback({
      overrideBasePath: `/images/custom/restaurants/${r.slug}/card`,
      fallback: r.image,
    });

    const coverImage = resolveImageWithFallback({
      overrideBasePath: `/images/custom/restaurants/${r.slug}/cover`,
      fallback: r.coverImage,
    });

    return {
      ...r,
      image: restaurantImage ?? r.image,
      coverImage: coverImage ?? r.coverImage,
      cuisineTypes: ((): string[] => {
        try {
          return typeof r.cuisineTypes === 'string'
            ? (JSON.parse(r.cuisineTypes) as string[])
            : [];
        } catch {
          return [];
        }
      })(),
    };
  });
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

  const restaurantImage = resolveImageWithFallback({
    overrideBasePath: `/images/custom/restaurants/${restaurant.slug}/card`,
    fallback: restaurant.image,
  });

  const coverImage = resolveImageWithFallback({
    overrideBasePath: `/images/custom/restaurants/${restaurant.slug}/cover`,
    fallback: restaurant.coverImage || restaurant.image,
  });

  return {
    ...restaurant,
    image: restaurantImage ?? restaurant.image,
    coverImage: coverImage ?? restaurant.coverImage,
    dishes: restaurant.dishes.map((d) => ({
      ...d,
      image:
        resolveImageWithFallback({
          overrideBasePath: `/images/custom/dishes/${d.category?.slug ?? 'other'}/${d.slug}`,
          fallback:
            resolveImageWithFallback({
              // Backward-compatible fallback (old structure):
              // public/images/custom/dishes/<dish-slug>.<ext>
              overrideBasePath: `/images/custom/dishes/${d.slug}`,
              fallback: d.image,
            }) ?? d.image,
        }) ?? d.image,
    })),
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
  return dishes
    .map((d) => ({
      ...d,
      image:
        resolveImageWithFallback({
          overrideBasePath: `/images/custom/dishes/${d.category?.slug ?? 'other'}/${d.slug}`,
          fallback:
            resolveImageWithFallback({
              overrideBasePath: `/images/custom/dishes/${d.slug}`,
              fallback: d.image,
            }) ?? d.image,
        }) ?? d.image,
    }))
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
