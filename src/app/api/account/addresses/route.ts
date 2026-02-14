import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { address } = body;
  if (!address || typeof address !== 'string' || !address.trim()) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  const isFirst = (await prisma.userAddress.count({ where: { userId: session.user.id } })) === 0;

  await prisma.userAddress.create({
    data: {
      userId: session.user.id,
      address: address.trim(),
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
    prisma.userAddress.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    }),
    prisma.userAddress.updateMany({
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

  await prisma.userAddress.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
