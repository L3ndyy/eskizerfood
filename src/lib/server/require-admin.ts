import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' as const, status: 401 as const };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    return { error: 'Forbidden' as const, status: 403 as const };
  }

  return { session, userId: session.user.id };
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' as const, status: 401 as const };
  }
  return { session, userId: session.user.id };
}
