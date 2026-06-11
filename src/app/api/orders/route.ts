import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { isValidPhone, PHONE_VALIDATION_ERROR } from '@/lib/utils';

const orderSchema = z.object({
  restaurantId: z.string(),
  address: z.string().min(1),
  phone: z.string().refine(isValidPhone, PHONE_VALIDATION_ERROR),
  comment: z.string().optional(),
  items: z.array(
    z.object({
      dishId: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
    })
  ),
  total: z.number().min(0),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  const { restaurantId, address, phone, comment, items, total } = parsed.data;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }

  const deliveryTime = restaurant.deliveryTime + Math.floor(Math.random() * 10);

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      restaurantId,
      status: 'PENDING',
      total,
      address,
      phone,
      comment,
      deliveryTime,
      items: {
        create: items.map((i) => ({
          dishId: i.dishId,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({
    orderId: order.id,
  });
}
