import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveDbProvider } from '@/lib/create-prisma-client';

function maskDatabaseUrl(url: string | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url.replace(/^postgres:/, 'postgresql:'));
    return {
      host: parsed.hostname,
      database: parsed.pathname.replace(/^\//, ''),
      user: parsed.username,
    };
  } catch {
    return { host: 'invalid-url' };
  }
}

export async function GET() {
  try {
    const provider = resolveDbProvider();

    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    const groupTables = ['GroupSession', 'GroupParticipant', 'GroupCartItem'];
    const present = new Set(tables.map((t) => t.tablename));

    let restaurantCount = 0;
    let userCount = 0;
    try {
      restaurantCount = await prisma.restaurant.count();
      userCount = await prisma.user.count();
    } catch {
      /* tables may be missing */
    }

    const groupOrderReady = groupTables.every((name) => present.has(name));

    return NextResponse.json({
      ok: true,
      provider,
      database: maskDatabaseUrl(process.env.DATABASE_URL),
      restaurantCount,
      userCount,
      groupOrderReady,
      groupTables: Object.fromEntries(groupTables.map((name) => [name, present.has(name)])),
      tableCount: tables.length,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        provider: resolveDbProvider(),
        database: maskDatabaseUrl(process.env.DATABASE_URL),
        error: detail,
      },
      { status: 500 }
    );
  }
}
