import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/server/require-admin';

const dishSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  image: z.string().optional(),
  weight: z.string().optional(),
  categoryId: z.string(),
  restaurantId: z.string(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const dishes = await prisma.dish.findMany({
    include: { restaurant: true, category: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(dishes);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const parsed = dishSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const dish = await prisma.dish.create({ data: parsed.data });
  return NextResponse.json(dish);
}
