import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/server/require-admin';

const cartItemSchema = z.object({
  dishId: z.string(),
  dishName: z.string(),
  price: z.number().min(0),
  quantity: z.number().min(1),
  image: z.string().optional(),
  restaurantId: z.string(),
  restaurantName: z.string(),
});

const cartSchema = z.object({
  items: z.array(cartItemSchema),
  restaurantId: z.string().nullable(),
});

export async function GET() {
  const authResult = await requireUser();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const items = await prisma.userCartItem.findMany({
    where: { userId: authResult.userId },
    orderBy: { dishName: 'asc' },
  });

  const restaurantId = items[0]?.restaurantId ?? null;

  return NextResponse.json({
    items: items.map((item) => ({
      dishId: item.dishId,
      dishName: item.dishName,
      price: item.price,
      quantity: item.quantity,
      image: item.image ?? undefined,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
    })),
    restaurantId,
  });
}

export async function PUT(request: Request) {
  const authResult = await requireUser();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();
  const parsed = cartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
  }

  const { items } = parsed.data;

  await prisma.$transaction([
    prisma.userCartItem.deleteMany({ where: { userId: authResult.userId } }),
    ...(items.length > 0
      ? [
          prisma.userCartItem.createMany({
            data: items.map((item) => ({
              userId: authResult.userId,
              dishId: item.dishId,
              dishName: item.dishName,
              price: item.price,
              quantity: item.quantity,
              image: item.image ?? null,
              restaurantId: item.restaurantId,
              restaurantName: item.restaurantName,
            })),
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const authResult = await requireUser();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  await prisma.userCartItem.deleteMany({ where: { userId: authResult.userId } });
  return NextResponse.json({ ok: true });
}
