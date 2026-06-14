import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/server/require-admin';
import {
  createGroupCartItem,
  createGroupSessionWithParticipant,
  ensureGroupOrderSchema,
  getAnchorRestaurantId,
  groupOrderTablesExist,
  groupCartHasRestaurantColumns,
} from '@/lib/server/ensure-group-order-schema';

const cartItemSchema = z.object({
  dishId: z.string(),
  quantity: z.number().min(1).default(1),
  restaurantId: z.string().optional(),
  restaurantName: z.string().optional(),
});

const createSchema = z.object({
  restaurantId: z.string().optional(),
  cartItems: z.array(cartItemSchema).optional(),
});

export async function POST(request: Request) {
  try {
    if (!(await groupOrderTablesExist())) {
      return NextResponse.json(
        {
          error:
            'Таблицы группового заказа не найдены. В Neon SQL Editor выполните prisma/.neon-fix-group-order.sql',
        },
        { status: 503 }
      );
    }

    await ensureGroupOrderSchema();
    const extendedCartColumns = await groupCartHasRestaurantColumns();

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

    const anchorRestaurantId =
      restaurantId ?? (await getAnchorRestaurantId());

    if (!anchorRestaurantId) {
      return NextResponse.json(
        {
          error:
            'В базе нет ресторанов. В Neon SQL Editor выполните prisma/.neon-seed.sql',
        },
        { status: 503 }
      );
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            'Пользователь не найден в базе. Выйдите из аккаунта и войдите снова (admin@food.ru / admin123 после seed).',
        },
        { status: 401 }
      );
    }

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
          where: { id: item.dishId, isAvailable: true },
          include: { restaurant: { select: { id: true, name: true, isActive: true } } },
        });
        if (!dish || !dish.restaurant.isActive) continue;

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

    const session = await createGroupSessionWithParticipant({
      token,
      initiatorUserId: authResult.userId,
      restaurantId: anchorRestaurantId,
      expiresAt,
      displayName: user.name || user.email || 'Инициатор',
    });

    for (const item of preparedItems) {
      await createGroupCartItem(session.id, item, extendedCartColumns);
    }

    return NextResponse.json({
      token: session.token,
      joinUrl: `/group-order/join/${session.token}`,
    });
  } catch (error) {
    console.error('group-order create error:', error);
    const detail = error instanceof Error ? error.message : String(error);

    let message = 'Ошибка создания группового заказа';
    if (/42P01|relation .* does not exist/i.test(detail)) {
      message =
        'Таблицы группового заказа не найдены — выполните prisma/.neon-fix-group-order.sql в Neon SQL Editor';
    } else if (/column|restaurantId|restaurantName/i.test(detail)) {
      message =
        'Схема устарела — выполните prisma/.neon-fix-group-order.sql в Neon SQL Editor';
    } else if (/Foreign key|23503|initiatorUserId/i.test(detail)) {
      message =
        'Пользователь или ресторан не найден — выполните prisma/.neon-seed.sql и войдите заново';
    }

    return NextResponse.json({ error: message, detail }, { status: 500 });
  }
}
