import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const postSchema = z.object({ message: z.string().min(1).max(2000) });

function checkSupportModel() {
  if (typeof (prisma as { supportConversation?: unknown }).supportConversation === 'undefined') {
    return NextResponse.json(
      { error: 'Модуль поддержки не загружен. Остановите сервер, выполните: npx prisma generate. Удалите папку .next и запустите снова: npm run dev' },
      { status: 503 }
    );
  }
  return null;
}

export async function GET() {
  const err = checkSupportModel();
  if (err) return err;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conv = await prisma.supportConversation.findUnique({
    where: { userId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  return NextResponse.json({
    conversation: conv
      ? {
          id: conv.id,
          messages: conv.messages.map((m) => ({
            id: m.id,
            body: m.body,
            isFromAdmin: m.isFromAdmin,
            createdAt: m.createdAt.toISOString(),
          })),
        }
      : null,
  });
}

export async function POST(request: NextRequest) {
  const err = checkSupportModel();
  if (err) return err;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
  }

  let conv = await prisma.supportConversation.findUnique({
    where: { userId: session.user.id },
  });

  if (!conv) {
    conv = await prisma.supportConversation.create({
      data: { userId: session.user.id },
    });
  }

  const message = await prisma.supportMessage.create({
    data: {
      conversationId: conv.id,
      body: parsed.data.message.trim(),
      isFromAdmin: false,
    },
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
