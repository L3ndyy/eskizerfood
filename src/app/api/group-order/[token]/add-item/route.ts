import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getActiveGroupSession } from '@/lib/server/group-order';
import { requireUser } from '@/lib/server/require-admin';

const addItemSchema = z.object({
  dishId: z.string(),
  quantity: z.number().min(1).default(1),
  modifiers: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const authResult = await requireUser();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { token } = await params;
  const session = await getActiveGroupSession(token);
  if (!session || session.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Session unavailable' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const dish = await prisma.dish.findFirst({
    where: {
      id: parsed.data.dishId,
      restaurantId: session.restaurantId,
      isAvailable: true,
    },
  });
  if (!dish) {
    return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
  }

  await prisma.groupParticipant.upsert({
    where: {
      groupSessionId_userId: {
        groupSessionId: session.id,
        userId: authResult.userId,
      },
    },
    update: {},
    create: {
      groupSessionId: session.id,
      userId: authResult.userId,
      displayName: 'Участник',
    },
  });

  const existing = await prisma.groupCartItem.findFirst({
    where: {
      groupSessionId: session.id,
      userId: authResult.userId,
      dishId: dish.id,
    },
  });

  if (existing) {
    await prisma.groupCartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + parsed.data.quantity },
    });
  } else {
    await prisma.groupCartItem.create({
      data: {
        groupSessionId: session.id,
        userId: authResult.userId,
        dishId: dish.id,
        dishName: dish.name,
        price: dish.price,
        quantity: parsed.data.quantity,
        modifiers: parsed.data.modifiers,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
