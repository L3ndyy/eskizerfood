/**
 * Сброс пароля админа. Запуск: npx tsx scripts/reset-admin.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@food.ru' },
    update: { password: hashedPassword, isAdmin: true },
    create: {
      name: 'Admin',
      email: 'admin@food.ru',
      password: hashedPassword,
      bonusPoints: 500,
      isAdmin: true,
    },
  });
  console.log('✓ Админ обновлён: admin@food.ru / admin123');
}

main().finally(() => prisma.$disconnect());
