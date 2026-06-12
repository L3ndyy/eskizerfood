import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getActiveGroupSession } from '@/lib/server/group-order';
import { requireUser } from '@/lib/server/require-admin';
import { prisma } from '@/lib/prisma';

const finalizeSchema = z.object({
  paymentMode: z.enum(['CENTRALIZED', 'SPLIT']),
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

  if (session.initiatorUserId !== authResult.userId) {
    return NextResponse.json({ error: 'Only initiator can finalize' }, { status: 403 });
  }

  if (session.cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = finalizeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  await prisma.groupSession.update({
    where: { id: session.id },
    data: { paymentMode: parsed.data.paymentMode, status: 'CLOSED' },
  });

  if (parsed.data.paymentMode === 'CENTRALIZED') {
    return NextResponse.json({
      redirectUrl: `/payment?groupToken=${token}`,
    });
  }

  return NextResponse.json({
    redirectUrl: `/payment?groupToken=${token}&split=true`,
    message: 'Each participant should pay their share',
  });
}
