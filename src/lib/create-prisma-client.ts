import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export type DbProvider = 'sqlite' | 'mysql' | 'postgresql';

export function resolveDbProvider(): DbProvider {
  const explicit = process.env.PRISMA_PROVIDER;
  if (explicit === 'sqlite' || explicit === 'mysql' || explicit === 'postgresql') {
    return explicit;
  }

  const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';
  if (url.startsWith('file:')) return 'sqlite';
  if (url.startsWith('mysql://')) return 'mysql';
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) return 'postgresql';

  return 'sqlite';
}

export function createPrismaClient(): PrismaClient {
  const provider = resolveDbProvider();

  if (provider === 'sqlite') {
    const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3') as typeof import('@prisma/adapter-better-sqlite3');
    const adapter = new PrismaBetterSqlite3({ url });
    return new PrismaClient({ adapter });
  }

  if (provider === 'mysql') {
    const url = process.env.DATABASE_URL;
    if (!url?.startsWith('mysql://')) {
      throw new Error('DATABASE_URL должен начинаться с mysql:// для MySQL');
    }
    const { PrismaMariaDb } = require('@prisma/adapter-mariadb') as typeof import('@prisma/adapter-mariadb');
    const adapter = new PrismaMariaDb(url);
    return new PrismaClient({ adapter });
  }

  if (provider === 'postgresql') {
    const url = process.env.DATABASE_URL;
    if (!url?.startsWith('postgresql://') && !url?.startsWith('postgres://')) {
      throw new Error('DATABASE_URL должен быть postgres:// или postgresql://');
    }
    const { PrismaNeon } = require('@prisma/adapter-neon') as typeof import('@prisma/adapter-neon');
    const adapter = new PrismaNeon({ connectionString: url });
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
}

export function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma;
  }
  return createPrismaClient();
}
