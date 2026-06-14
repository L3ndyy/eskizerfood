import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { isValidPhone, PHONE_VALIDATION_ERROR } from '@/lib/utils';
import { requireUser } from '@/lib/server/require-admin';
import { ensureDemoCard } from '@/lib/server/ensure-demo-card';

const orderSchema = z.object({
  restaurantId: z.string().optional(),
  address: z.string().min(3),
  phone: z.string().refine(isValidPhone, PHONE_VALIDATION_ERROR),
  comment: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  paymentMethod: z.enum(['CARD', 'CASH', 'SPLIT']),
  paymentCardId: z.string().optional(),
  groupSessionId: z.string().optional(),
  groupToken: z.string().optional(),
  split: z.boolean().optional(),
  items: z.array(
    z.object({
      dishId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0).optional(),
      restaurantId: z.string().optional(),
    })
  ).optional().default([]),
});

type OrderItemInput = {
  dishId: string;
  quantity: number;
  price?: number;
  restaurantId?: string;
};

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireUser();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const message =
        fieldErrors.phone?.[0] ||
        fieldErrors.address?.[0] ||
        'Некорректные данные заказа';
      return NextResponse.json({ error: message, details: fieldErrors }, { status: 400 });
    }

    const data = parsed.data;
    let items: OrderItemInput[] = data.items;
    let groupSessionId = data.groupSessionId;
    let paymentCardId = data.paymentCardId;

    if (data.groupToken) {
      const session = await prisma.groupSession.findUnique({
        where: { token: data.groupToken },
        include: { cartItems: true },
      });

      if (
        !session ||
        !['ACTIVE', 'CLOSED'].includes(session.status) ||
        session.expiresAt < new Date()
      ) {
        return NextResponse.json({ error: 'Group session unavailable' }, { status: 400 });
      }

      groupSessionId = session.id;
      const sourceItems = data.split
        ? session.cartItems.filter((item) => item.userId === authResult.userId)
        : session.cartItems;

      items = sourceItems.map((item) => ({
        dishId: item.dishId,
        quantity: item.quantity,
        price: item.price,
        restaurantId: item.restaurantId,
      }));
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (data.paymentMethod === 'CARD' && !paymentCardId) {
      await ensureDemoCard(authResult.userId);
      const defaultCard = await prisma.paymentCard.findFirst({
        where: { userId: authResult.userId },
        orderBy: { isDefault: 'desc' },
      });
      if (defaultCard) {
        paymentCardId = defaultCard.id;
      } else {
        return NextResponse.json({ error: 'Выберите или добавьте карту' }, { status: 400 });
      }
    }

    if (paymentCardId) {
      const card = await prisma.paymentCard.findFirst({
        where: { id: paymentCardId, userId: authResult.userId },
      });
      if (!card) {
        return NextResponse.json({ error: 'Invalid payment card' }, { status: 400 });
      }
    }

    const dishes = await prisma.dish.findMany({
      where: { id: { in: items.map((item) => item.dishId) } },
      select: { id: true, price: true, isAvailable: true, restaurantId: true },
    });
    const dishMap = new Map(dishes.map((dish) => [dish.id, dish]));

    const itemsByRestaurant = new Map<string, OrderItemInput[]>();
    for (const item of items) {
      const dish = dishMap.get(item.dishId);
      if (!dish) {
        return NextResponse.json(
          { error: 'Одно из блюд больше не доступно в меню. Обновите групповую корзину.' },
          { status: 400 }
        );
      }
      if (!dish.isAvailable && !data.groupToken) {
        return NextResponse.json({ error: 'Некоторые блюда недоступны' }, { status: 400 });
      }
      const rid = item.restaurantId || dish.restaurantId;
      if (!itemsByRestaurant.has(rid)) itemsByRestaurant.set(rid, []);
      itemsByRestaurant.get(rid)!.push(item);
    }

    const restaurantIds = [...itemsByRestaurant.keys()];
    const restaurants = await prisma.restaurant.findMany({
      where: { id: { in: restaurantIds } },
    });
    const restaurantMap = new Map(restaurants.map((r) => [r.id, r]));

    const orderIds: string[] = [];

    for (const [restaurantId, restaurantItems] of itemsByRestaurant) {
      const restaurant = restaurantMap.get(restaurantId);
      if (!restaurant) {
        return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
      }

      let subtotal = 0;
      for (const item of restaurantItems) {
        const dish = dishMap.get(item.dishId)!;
        const unitPrice =
          data.groupToken && item.price != null ? item.price : dish.price;
        subtotal += unitPrice * item.quantity;
      }

      if (subtotal < restaurant.minOrder) {
        return NextResponse.json(
          { error: `Минимальный заказ в «${restaurant.name}»: ${restaurant.minOrder} ₽` },
          { status: 400 }
        );
      }

      const total = subtotal + restaurant.deliveryFee;
      const deliveryTime = restaurant.deliveryTime + Math.floor(Math.random() * 10);

      const order = await prisma.order.create({
        data: {
          userId: authResult.userId,
          restaurantId,
          status: 'PENDING',
          paymentStatus: 'PAID',
          paymentMethod: data.paymentMethod,
          paymentCardId: paymentCardId,
          groupSessionId,
          total,
          address: data.address,
          phone: data.phone,
          comment: data.comment,
          lat: data.lat,
          lng: data.lng,
          deliveryTime,
          items: {
            create: restaurantItems.map((item) => {
              const dish = dishMap.get(item.dishId)!;
              const unitPrice =
                data.groupToken && item.price != null ? item.price : dish.price;
              return {
                dishId: item.dishId,
                quantity: item.quantity,
                price: unitPrice,
              };
            }),
          },
        },
      });
      orderIds.push(order.id);
    }

    if (groupSessionId && data.split) {
      await prisma.groupParticipant.updateMany({
        where: { groupSessionId, userId: authResult.userId },
        data: { hasPaid: true },
      });

      const unpaid = await prisma.groupParticipant.count({
        where: { groupSessionId, hasPaid: false },
      });

      if (unpaid === 0) {
        await prisma.groupSession.update({
          where: { id: groupSessionId },
          data: { status: 'COMPLETED' },
        });
      }
    } else if (groupSessionId) {
      await prisma.groupSession.update({
        where: { id: groupSessionId },
        data: { status: 'COMPLETED', paymentMode: 'CENTRALIZED' },
      });
    }

    await prisma.userCartItem.deleteMany({ where: { userId: authResult.userId } });

    return NextResponse.json({ orderId: orderIds[0], orderIds });
  } catch (error) {
    console.error('orders POST error:', error);
    return NextResponse.json({ error: 'Ошибка создания заказа' }, { status: 500 });
  }
}
