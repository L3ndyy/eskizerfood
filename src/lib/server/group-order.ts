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

export async function serializeGroupSession(
  session: NonNullable<Awaited<ReturnType<typeof getActiveGroupSession>>>
) {
  const restaurantIds = [
    ...new Set(
      session.cartItems
        .map((item) => item.restaurantId)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  if (session.restaurantId && !restaurantIds.includes(session.restaurantId)) {
    restaurantIds.push(session.restaurantId);
  }

  const restaurants = restaurantIds.length
    ? await prisma.restaurant.findMany({
        where: { id: { in: restaurantIds }, isActive: true },
      })
    : session.restaurant
      ? [session.restaurant]
      : [];

  const subtotal = session.cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalDeliveryFee = restaurants.reduce((sum, r) => sum + r.deliveryFee, 0);

  const restaurantsPayload = restaurants.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    deliveryFee: restaurant.deliveryFee,
    minOrder: restaurant.minOrder,
  }));

  return {
    id: session.id,
    token: session.token,
    status: session.status,
    paymentMode: session.paymentMode,
    expiresAt: session.expiresAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
    restaurant: restaurantsPayload[0] ?? null,
    restaurants: restaurantsPayload,
    totalDeliveryFee,
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
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
    })),
    total: subtotal,
    grandTotal: subtotal + totalDeliveryFee,
  };
}
