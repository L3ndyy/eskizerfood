import { prisma } from '@/lib/prisma';

export async function getActiveGroupSession(token: string) {
  const session = await prisma.groupSession.findUnique({
    where: { token },
    include: {
      restaurant: true,
      participants: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      cartItems: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { dishName: 'asc' },
      },
      initiator: { select: { id: true, name: true, email: true } },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date() && session.status === 'ACTIVE') {
    await prisma.groupSession.update({
      where: { id: session.id },
      data: { status: 'EXPIRED' },
    });
    return { ...session, status: 'EXPIRED' as const };
  }

  return session;
}

export function serializeGroupSession(
  session: NonNullable<Awaited<ReturnType<typeof getActiveGroupSession>>>
) {
  return {
    id: session.id,
    token: session.token,
    status: session.status,
    paymentMode: session.paymentMode,
    expiresAt: session.expiresAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
    restaurant: {
      id: session.restaurant.id,
      name: session.restaurant.name,
      slug: session.restaurant.slug,
      deliveryFee: session.restaurant.deliveryFee,
      minOrder: session.restaurant.minOrder,
    },
    initiator: session.initiator,
    participants: session.participants.map((participant) => ({
      id: participant.id,
      userId: participant.userId,
      displayName: participant.displayName,
      hasPaid: participant.hasPaid,
      joinedAt: participant.joinedAt.toISOString(),
    })),
    cartItems: session.cartItems.map((item) => ({
      id: item.id,
      userId: item.userId,
      userName: item.user.name || item.user.email || 'Участник',
      dishId: item.dishId,
      dishName: item.dishName,
      price: item.price,
      quantity: item.quantity,
      modifiers: item.modifiers,
    })),
    total: session.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}
