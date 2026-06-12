import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getActiveGroupSession } from '@/lib/server/group-order';
import { requireUser } from '@/lib/server/require-admin';

const removeSchema = z.object({
  itemId: z.string(),
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
  const parsed = removeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const item = await prisma.groupCartItem.findUnique({
    where: { id: parsed.data.itemId },
  });
  if (!item || item.groupSessionId !== session.id) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const isInitiator = session.initiatorUserId === authResult.userId;
  if (item.userId !== authResult.userId && !isInitiator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.groupCartItem.delete({ where: { id: item.id } });
  return NextResponse.json({ ok: true });
}
