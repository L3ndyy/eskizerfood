import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const replySchema = z.object({ message: z.string().min(1).max(2000) });

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const conversation = await prisma.supportConversation.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      user: conversation.user,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        body: m.body,
        isFromAdmin: m.isFromAdmin,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
  }

  const conversation = await prisma.supportConversation.findUnique({
    where: { id },
  });
  if (!conversation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const message = await prisma.supportMessage.create({
    data: {
      conversationId: id,
      body: parsed.data.message.trim(),
      isFromAdmin: true,
    },
  });

  await prisma.supportConversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    message: {
      id: message.id,
      body: message.body,
      isFromAdmin: message.isFromAdmin,
      createdAt: message.createdAt.toISOString(),
    },
  });
}
