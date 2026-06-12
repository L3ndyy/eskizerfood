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

  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { name: true, email: true },
  });

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
      displayName: user?.name || user?.email || 'Участник',
    },
  });

  return NextResponse.json({ ok: true });
}
