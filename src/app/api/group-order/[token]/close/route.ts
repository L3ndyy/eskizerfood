import { NextResponse } from 'next/server';
import { getActiveGroupSession } from '@/lib/server/group-order';
import { requireUser } from '@/lib/server/require-admin';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: Request,
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
    return NextResponse.json({ error: 'Only initiator can close session' }, { status: 403 });
  }

  await prisma.groupSession.update({
    where: { id: session.id },
    data: { status: 'CLOSED' },
  });

  return NextResponse.json({ ok: true });
}
