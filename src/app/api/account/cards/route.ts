import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { number, brand } = body;
  if (!number || typeof number !== 'string' || number.replace(/\D/g, '').length !== 16) {
    return NextResponse.json({ error: 'Invalid card number' }, { status: 400 });
  }

  const lastFour = number.slice(-4);
  const isFirst = (await prisma.paymentCard.count({ where: { userId: session.user.id } })) === 0;

  await prisma.paymentCard.create({
    data: {
      userId: session.user.id,
      lastFour,
      brand: brand || 'Card',
      isDefault: isFirst,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, isDefault } = body;
  if (!id || !isDefault) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  await prisma.$transaction([
    prisma.paymentCard.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    }),
    prisma.paymentCard.updateMany({
      where: { id, userId: session.user.id },
      data: { isDefault: true },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.paymentCard.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
