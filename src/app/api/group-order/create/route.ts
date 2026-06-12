import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/server/require-admin';

const createSchema = z.object({
  restaurantId: z.string(),
});

export async function POST(request: Request) {
  const authResult = await requireUser();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: parsed.data.restaurantId, isActive: true },
  });
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { name: true, email: true },
  });

  const session = await prisma.groupSession.create({
    data: {
      token,
      initiatorUserId: authResult.userId,
      restaurantId: parsed.data.restaurantId,
      expiresAt,
      participants: {
        create: {
          userId: authResult.userId,
          displayName: user?.name || user?.email || 'Инициатор',
        },
      },
    },
  });

  return NextResponse.json({
    token: session.token,
    joinUrl: `/group-order/join/${session.token}`,
  });
}
