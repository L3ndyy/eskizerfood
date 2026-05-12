import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

  const conversations = await prisma.supportConversation.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    conversations: conversations.map((c) => ({
      id: c.id,
      user: c.user,
      lastMessage: c.messages[0]
        ? {
            body: c.messages[0].body,
            isFromAdmin: c.messages[0].isFromAdmin,
            createdAt: c.messages[0].createdAt.toISOString(),
          }
        : null,
      updatedAt: c.updatedAt.toISOString(),
    })),
  });
}
