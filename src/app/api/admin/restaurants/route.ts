import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/server/require-admin';

const restaurantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  coverImage: z.string().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  deliveryTime: z.number().min(1),
  minOrder: z.number().min(0),
  deliveryFee: z.number().min(0),
  cuisineTypes: z.string(),
  address: z.string().min(1),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const restaurants = await prisma.restaurant.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(restaurants);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const parsed = restaurantSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const restaurant = await prisma.restaurant.create({ data: parsed.data });
  return NextResponse.json(restaurant);
}
