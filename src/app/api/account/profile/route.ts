import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone } = body;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(typeof name === 'string' && { name }),
      ...(typeof phone === 'string' && { phone }),
    },
  });

  return NextResponse.json({ ok: true });
}
