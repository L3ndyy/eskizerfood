import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/server/require-admin';

export async function GET() {
  const authResult = await requireUser();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const cards = await prisma.paymentCard.findMany({
    where: { userId: authResult.userId },
    orderBy: { isDefault: 'desc' },
    select: { id: true, lastFour: true, brand: true, isDefault: true },
  });

  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const authResult = await requireUser();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();
  const { number, brand } = body;
  if (!number || typeof number !== 'string' || number.replace(/\D/g, '').length !== 16) {
    return NextResponse.json({ error: 'Invalid card number' }, { status: 400 });
  }

  const lastFour = number.slice(-4);
  const isFirst =
    (await prisma.paymentCard.count({ where: { userId: authResult.userId } })) === 0;

  await prisma.paymentCard.create({
    data: {
      userId: authResult.userId,
      lastFour,
      brand: brand || 'Card',
      isDefault: isFirst,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const authResult = await requireUser();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();
  const { id, isDefault } = body;
  if (!id || !isDefault) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  await prisma.$transaction([
    prisma.paymentCard.updateMany({
      where: { userId: authResult.userId },
      data: { isDefault: false },
    }),
    prisma.paymentCard.updateMany({
      where: { id, userId: authResult.userId },
      data: { isDefault: true },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireUser();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.paymentCard.deleteMany({
    where: { id, userId: authResult.userId },
  });

  return NextResponse.json({ ok: true });
}
