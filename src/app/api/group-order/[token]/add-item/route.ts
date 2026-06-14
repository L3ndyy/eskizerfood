import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getActiveGroupSession } from '@/lib/server/group-order';
import { requireUser } from '@/lib/server/require-admin';
import { ensureGroupOrderSchema } from '@/lib/server/ensure-group-order-schema';

const addItemSchema = z.object({
  dishId: z.string(),
  quantity: z.number().min(1).default(1),
  modifiers: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await ensureGroupOrderSchema();

    const authResult = await requireUser();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { token } = await params;
    const session = await getActiveGroupSession(token);
    if (!session || session.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Session unavailable' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const dish = await prisma.dish.findFirst({
      where: {
        id: parsed.data.dishId,
        isAvailable: true,
      },
      include: { restaurant: { select: { id: true, name: true, isActive: true } } },
    });

    if (!dish || !dish.restaurant.isActive) {
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
          restaurantId: dish.restaurantId,
          restaurantName: dish.restaurant.name,
        },
      });
    }

    if (!session.restaurantId) {
      await prisma.groupSession.update({
        where: { id: session.id },
        data: { restaurantId: dish.restaurantId },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('group-order add-item error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
