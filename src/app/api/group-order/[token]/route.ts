import { NextResponse } from 'next/server';
import { getActiveGroupSession, serializeGroupSession } from '@/lib/server/group-order';
import { requireUser } from '@/lib/server/require-admin';
import { ensureGroupOrderSchema } from '@/lib/server/ensure-group-order-schema';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  await ensureGroupOrderSchema();

  const authResult = await requireUser();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { token } = await params;
  const session = await getActiveGroupSession(token);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json(await serializeGroupSession(session));
}
