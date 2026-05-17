/**
 * Создаёт deploy/timeweb.sql — вставить в phpMyAdmin → SQL → Выполнить
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import { categoryImages, categories, restaurantsData } from '../prisma/seed-data';

const root = join(__dirname, '..');
const outPath = join(root, 'deploy', 'timeweb.sql');

function esc(s: string) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "''");
}

async function main() {
  console.log('Схема таблиц...');
  execSync(
    'npx prisma migrate diff --from-empty --to-schema prisma/schema.mysql.prisma --script -o deploy/timeweb-schema-only.sql',
    { cwd: root, stdio: 'inherit' }
  );

  const schema = readFileSync(join(root, 'deploy', 'timeweb-schema-only.sql'), 'utf8');
  const adminHash = await bcrypt.hash('admin123', 12);
  const userHash = await bcrypt.hash('user123', 12);
  const now = 'NOW(3)';

  const lines: string[] = [
    '-- FoodExpress — полная установка БД для Timeweb MySQL 8.0',
    '-- phpMyAdmin: выберите вашу базу → SQL → вставьте ВСЁ → Выполнить',
    '',
    'SET NAMES utf8mb4;',
    'SET FOREIGN_KEY_CHECKS = 0;',
    '',
  ];

  for (const t of [
    'Favorite', 'OrderItem', 'Order', 'Dish', 'Category', 'Restaurant',
    'SupportMessage', 'SupportConversation', 'UserAddress', 'PaymentCard',
    'Session', 'Account', 'VerificationToken', 'User',
  ]) {
    lines.push(`DROP TABLE IF EXISTS \`${t}\`;`);
  }
  lines.push('SET FOREIGN_KEY_CHECKS = 1;', '');

  lines.push(schema.trim(), '', '-- === Данные ===', '');

  const categoryIds: Record<string, string> = {};
  for (const cat of categories) {
    const id = `cat_${cat.slug}`;
    categoryIds[cat.slug] = id;
    const img = categoryImages[cat.slug as keyof typeof categoryImages];
    lines.push(
      `INSERT INTO \`Category\` (\`id\`,\`name\`,\`slug\`,\`image\`,\`sortOrder\`) VALUES ('${id}','${esc(cat.name)}','${cat.slug}',${img ? `'${esc(img)}'` : 'NULL'},${cat.sortOrder});`
    );
  }

  lines.push(
    `INSERT INTO \`User\` (\`id\`,\`name\`,\`email\`,\`password\`,\`bonusPoints\`,\`isAdmin\`,\`createdAt\`,\`updatedAt\`) VALUES ` +
      `('user_admin','Admin','admin@food.ru','${esc(adminHash)}',500,1,${now},${now}),` +
      `('user_test','Test User','user@food.ru','${esc(userHash)}',150,0,${now},${now});`
  );

  let dishIdx = 0;
  for (const rest of restaurantsData) {
    const rid = `rest_${rest.slug}`;
    lines.push(
      `INSERT INTO \`Restaurant\` (\`id\`,\`name\`,\`slug\`,\`description\`,\`image\`,\`coverImage\`,\`rating\`,\`reviewCount\`,\`deliveryTime\`,\`minOrder\`,\`deliveryFee\`,\`cuisineTypes\`,\`address\`,\`isActive\`,\`createdAt\`,\`updatedAt\`) VALUES (` +
        `'${rid}','${esc(rest.name)}','${rest.slug}','${esc(rest.description)}','${esc(rest.image)}','${esc(rest.coverImage)}',${rest.rating},${rest.reviewCount},${rest.deliveryTime},${rest.minOrder},${rest.deliveryFee},'${esc(JSON.stringify(rest.cuisineTypes))}','${esc(rest.address)}',1,${now},${now});`
    );

    for (let i = 0; i < rest.dishes.length; i++) {
      const d = rest.dishes[i];
      const cid = categoryIds[d.categorySlug];
      if (!cid) continue;
      dishIdx += 1;
      const img = categoryImages[d.categorySlug as keyof typeof categoryImages];
      lines.push(
        `INSERT INTO \`Dish\` (\`id\`,\`name\`,\`slug\`,\`description\`,\`price\`,\`image\`,\`weight\`,\`categoryId\`,\`restaurantId\`,\`isAvailable\`,\`sortOrder\`,\`createdAt\`,\`updatedAt\`) VALUES (` +
          `'dish_${dishIdx}','${esc(d.name)}','${d.slug}','${esc(d.description)}',${d.price},${img ? `'${esc(img)}'` : 'NULL'},'${esc(d.weight)}','${cid}','${rid}',1,${i + 1},${now},${now});`
      );
    }
  }

  restaurantsData.slice(0, 3).forEach((r, i) => {
    lines.push(`INSERT INTO \`Favorite\` (\`id\`,\`userId\`,\`restaurantId\`) VALUES ('fav_${i + 1}','user_test','rest_${r.slug}');`);
  });

  lines.push('', '-- Готово! admin@food.ru / admin123   user@food.ru / user123');

  writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`\n✓ deploy/timeweb.sql (${lines.length} строк)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
