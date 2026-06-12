import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const addresses = await prisma.userAddress.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: 'desc' },
    select: {
      id: true,
      address: true,
      city: true,
      apartment: true,
      lat: true,
      lng: true,
      isDefault: true,
    },
  });

  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { address, city, apartment, lat, lng } = body;
  if (!address || typeof address !== 'string' || !address.trim()) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  const isFirst = (await prisma.userAddress.count({ where: { userId: session.user.id } })) === 0;

  await prisma.userAddress.create({
    data: {
      userId: session.user.id,
      address: address.trim(),
      city: typeof city === 'string' ? city : null,
      apartment: typeof apartment === 'string' ? apartment : null,
      lat: typeof lat === 'number' ? lat : null,
      lng: typeof lng === 'number' ? lng : null,
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
