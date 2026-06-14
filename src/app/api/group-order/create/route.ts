import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/server/require-admin';
import {
  createGroupCartItem,
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
            'Таблицы группового заказа не найдены. В Neon SQL Editor выполните prisma/.neon-push.sql',
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

    const session = await prisma.groupSession.create({
      data: {
        token,
        initiatorUserId: authResult.userId,
        restaurantId: anchorRestaurantId,
        expiresAt,
        participants: {
          create: {
            userId: authResult.userId,
            displayName: user?.name || user?.email || 'Инициатор',
          },
        },
      },
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
    if (/GroupSession|does not exist|42P01/i.test(detail)) {
      message = 'Таблицы не созданы — выполните prisma/.neon-push.sql в Neon SQL Editor';
    } else if (/restaurantId|column/i.test(detail)) {
      message = 'Обновите БД — выполните prisma/.neon-migrate-multi-group.sql в Neon SQL Editor';
    } else if (/Foreign key|23503/i.test(detail)) {
      message = 'Нет ресторанов в базе — выполните prisma/.neon-seed.sql';
    }

    return NextResponse.json({ error: message, detail }, { status: 500 });
  }
}
