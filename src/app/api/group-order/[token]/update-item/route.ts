import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getActiveGroupSession } from '@/lib/server/group-order';
import { requireUser } from '@/lib/server/require-admin';

const updateSchema = z.object({
  itemId: z.string(),
  delta: z.number().int(),
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
    return NextResponse.json({ error: 'Сессия недоступна' }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const item = await prisma.groupCartItem.findUnique({
    where: { id: parsed.data.itemId },
  });
  if (!item || item.groupSessionId !== session.id) {
    return NextResponse.json({ error: 'Блюдо не найдено' }, { status: 404 });
  }

  const isInitiator = session.initiatorUserId === authResult.userId;
  if (item.userId !== authResult.userId && !isInitiator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const nextQty = item.quantity + parsed.data.delta;
  if (nextQty <= 0) {
    await prisma.groupCartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.groupCartItem.update({
      where: { id: item.id },
      data: { quantity: nextQty },
    });
  }

  return NextResponse.json({ ok: true });
}
