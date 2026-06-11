import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isValidPhone, PHONE_VALIDATION_ERROR } from '@/lib/utils';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone } = body;

  if (typeof phone === 'string' && phone.trim() && !isValidPhone(phone)) {
    return NextResponse.json({ error: PHONE_VALIDATION_ERROR }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(typeof name === 'string' && { name }),
      ...(typeof phone === 'string' && { phone }),
    },
  });

  return NextResponse.json({ ok: true });
}
