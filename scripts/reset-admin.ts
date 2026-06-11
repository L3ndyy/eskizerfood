/**
 * Сброс пароля пользователя(ей).
 * Запуск:
 *   npx tsx scripts/reset-admin.ts
 *   npx tsx scripts/reset-admin.ts user@food.ru
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createPrismaClient } from '../src/lib/create-prisma-client';

const prisma = createPrismaClient();

const DEFAULT_ACCOUNTS = [
  { email: 'admin@food.ru', password: 'admin123', isAdmin: true, name: 'Admin', bonusPoints: 500 },
  { email: 'user@food.ru', password: 'user123', isAdmin: false, name: 'Test User', bonusPoints: 150 },
] as const;

async function resetAccount(account: (typeof DEFAULT_ACCOUNTS)[number]) {
  const hashedPassword = await bcrypt.hash(account.password, 12);
  await prisma.user.upsert({
    where: { email: account.email },
    update: {
      password: hashedPassword,
      isAdmin: account.isAdmin,
    },
    create: {
      name: account.name,
      email: account.email,
      password: hashedPassword,
      bonusPoints: account.bonusPoints,
      isAdmin: account.isAdmin,
    },
  });
  console.log(`✓ ${account.email} / ${account.password}`);
}

async function main() {
  const emailArg = process.argv[2];

  if (emailArg) {
    const account = DEFAULT_ACCOUNTS.find((item) => item.email === emailArg);
    if (!account) {
      console.error(`Неизвестный аккаунт: ${emailArg}`);
      console.error('Доступные: admin@food.ru, user@food.ru');
      process.exit(1);
    }
    await resetAccount(account);
    return;
  }

  console.log('Сброс паролей для всех тестовых аккаунтов:');
  for (const account of DEFAULT_ACCOUNTS) {
    await resetAccount(account);
  }
}

main().finally(() => prisma.$disconnect());
