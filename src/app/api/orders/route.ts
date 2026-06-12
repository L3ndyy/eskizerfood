import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { isValidPhone, PHONE_VALIDATION_ERROR } from '@/lib/utils';
import { requireUser } from '@/lib/server/require-admin';

const orderSchema = z.object({
  restaurantId: z.string(),
  address: z.string().min(10),
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
    })
  ).optional().default([]),
});

export async function POST(request: NextRequest) {
  const authResult = await requireUser();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();
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
  let items = data.items;
  let restaurantId = data.restaurantId;
  let groupSessionId = data.groupSessionId;

  if (data.groupToken) {
    const session = await prisma.groupSession.findUnique({
      where: { token: data.groupToken },
      include: {
        cartItems: true,
        participants: true,
      },
    });

    if (
      !session ||
      !['ACTIVE', 'CLOSED'].includes(session.status) ||
      session.expiresAt < new Date()
    ) {
      return NextResponse.json({ error: 'Group session unavailable' }, { status: 400 });
    }

    restaurantId = session.restaurantId;
    groupSessionId = session.id;

    if (data.split) {
      items = session.cartItems
        .filter((item) => item.userId === authResult.userId)
        .map((item) => ({
          dishId: item.dishId,
          quantity: item.quantity,
          price: item.price,
        }));
    } else {
      items = session.cartItems.map((item) => ({
        dishId: item.dishId,
        quantity: item.quantity,
        price: item.price,
      }));
    }
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }

  const dishes = await prisma.dish.findMany({
    where: { id: { in: items.map((item) => item.dishId) } },
    select: { id: true, price: true, isAvailable: true },
  });
  const dishMap = new Map(dishes.map((dish) => [dish.id, dish]));

  let subtotal = 0;
  for (const item of items) {
    const dish = dishMap.get(item.dishId);
    if (!dish || !dish.isAvailable) {
      return NextResponse.json({ error: 'Some dishes are unavailable' }, { status: 400 });
    }
    subtotal += dish.price * item.quantity;
  }

  const total = subtotal + restaurant.deliveryFee;
  if (subtotal < restaurant.minOrder) {
    return NextResponse.json(
      { error: `Минимальный заказ: ${restaurant.minOrder} ₽` },
      { status: 400 }
    );
  }

  if (data.paymentMethod === 'CARD' && !data.paymentCardId) {
    return NextResponse.json({ error: 'Select a payment card' }, { status: 400 });
  }

  if (data.paymentCardId) {
    const card = await prisma.paymentCard.findFirst({
      where: { id: data.paymentCardId, userId: authResult.userId },
    });
    if (!card) {
      return NextResponse.json({ error: 'Invalid payment card' }, { status: 400 });
    }
  }

  const deliveryTime = restaurant.deliveryTime + Math.floor(Math.random() * 10);

  const order = await prisma.order.create({
    data: {
      userId: authResult.userId,
      restaurantId,
      status: 'PENDING',
      paymentStatus: 'PAID',
      paymentMethod: data.paymentMethod,
      paymentCardId: data.paymentCardId,
      groupSessionId,
      total,
      address: data.address,
      phone: data.phone,
      comment: data.comment,
      lat: data.lat,
      lng: data.lng,
      deliveryTime,
      items: {
        create: items.map((item) => ({
          dishId: item.dishId,
          quantity: item.quantity,
          price: dishMap.get(item.dishId)!.price,
        })),
      },
    },
    include: { items: true },
  });

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

  return NextResponse.json({ orderId: order.id });
}
