import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/server/require-admin';

const cartItemSchema = z.object({
  dishId: z.string(),
  quantity: z.number().min(1).default(1),
  restaurantId: z.string(),
  restaurantName: z.string().optional(),
});

const createSchema = z.object({
  restaurantId: z.string().optional(),
  cartItems: z.array(cartItemSchema).optional(),
});

export async function POST(request: Request) {
  try {
    const authResult = await requireUser();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const { restaurantId, cartItems } = parsed.data;

    if (restaurantId) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId, isActive: true },
      });
      if (!restaurant) {
        return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
      }
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { name: true, email: true },
    });

    const preparedItems: Array<{
      userId: string;
      dishId: string;
      dishName: string;
      price: number;
      quantity: number;
      restaurantId: string;
      restaurantName: string;
    }> = [];

    if (cartItems?.length) {
      for (const item of cartItems) {
        const dish = await prisma.dish.findFirst({
          where: {
            id: item.dishId,
            restaurantId: item.restaurantId,
            isAvailable: true,
          },
          include: { restaurant: { select: { name: true } } },
        });
        if (!dish) continue;

        preparedItems.push({
          userId: authResult.userId,
          dishId: dish.id,
          dishName: dish.name,
          price: dish.price,
          quantity: item.quantity,
          restaurantId: dish.restaurantId,
          restaurantName: item.restaurantName || dish.restaurant.name,
        });
      }
    }

    const primaryRestaurantId =
      restaurantId ?? preparedItems[0]?.restaurantId ?? null;

    const session = await prisma.groupSession.create({
      data: {
        token,
        initiatorUserId: authResult.userId,
        restaurantId: primaryRestaurantId,
        expiresAt,
        participants: {
          create: {
            userId: authResult.userId,
            displayName: user?.name || user?.email || 'Инициатор',
          },
        },
        cartItems: preparedItems.length
          ? { create: preparedItems }
          : undefined,
      },
    });

    return NextResponse.json({
      token: session.token,
      joinUrl: `/group-order/join/${session.token}`,
    });
  } catch (error) {
    console.error('group-order create error:', error);
    return NextResponse.json({ error: 'Ошибка создания группового заказа' }, { status: 500 });
  }
}
