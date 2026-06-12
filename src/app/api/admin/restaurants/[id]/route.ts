import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/server/require-admin';

const restaurantSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  coverImage: z.string().nullable().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  deliveryTime: z.number().min(1).optional(),
  minOrder: z.number().min(0).optional(),
  deliveryFee: z.number().min(0).optional(),
  cuisineTypes: z.string().optional(),
  address: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(restaurant);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const parsed = restaurantSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(restaurant);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  await prisma.restaurant.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
