/**
 * Сброс пароля админа. Запуск: npx tsx scripts/reset-admin.ts
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createPrismaClient } from '../src/lib/create-prisma-client';

const prisma = createPrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
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
