/**
 * Чтение статических данных ресторанов из JSON (для экспорта на GitHub Pages).
 * Используется только при NEXT_PUBLIC_USE_STATIC_DATA=true.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export type StaticRestaurant = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  deliveryTime: number;
  minOrder: number;
  deliveryFee: number;
  cuisineTypes: string[];
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  dishes: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    weight: string | null;
    image: string | null;
    categoryId: string;
    isAvailable: boolean;
    sortOrder: number;
    category: { id: string; name: string; slug: string; image?: string | null; sortOrder?: number };
  }>;
};

let cached: StaticRestaurant[] | null = null;

function loadStaticRestaurants(): StaticRestaurant[] {
  if (cached) return cached;
  const path = join(process.cwd(), 'public', 'data', 'restaurants.json');
  const raw = readFileSync(path, 'utf-8');
  cached = JSON.parse(raw) as StaticRestaurant[];
  return cached;
}

export function getStaticRestaurants(): StaticRestaurant[] {
  return loadStaticRestaurants();
}

export function getStaticRestaurantBySlug(slug: string): StaticRestaurant | null {
  const list = loadStaticRestaurants();
  return list.find((r) => r.slug === slug) ?? null;
}

export function getStaticRestaurantSlugs(): string[] {
  return loadStaticRestaurants().map((r) => r.slug);
}
