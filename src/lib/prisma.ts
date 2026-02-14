import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL || 'file:./dev.db';
const isPostgres = url.startsWith('postgres');

function createPrismaClient() {
  if (isPostgres) {
    return new PrismaClient();
  }
  // SQLite (локальная разработка)
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

export const prisma = createPrismaClient();
