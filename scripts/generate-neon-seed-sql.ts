/**
 * Генерирует prisma/.neon-seed.sql — вставить в Neon → SQL Editor → Run
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import { categoryImages, categories, restaurantsData } from '../prisma/seed-data';

const outPath = join(__dirname, '..', 'prisma', '.neon-seed.sql');

function esc(s: string) {
  return String(s).replace(/'/g, "''");
}

function sqlStr(value: string | null | undefined) {
  if (value == null) return 'NULL';
  return `'${esc(value)}'`;
}

async function main() {
  const adminHash = await bcrypt.hash('admin123', 12);
  const userHash = await bcrypt.hash('user123', 12);
  const now = 'NOW()';

  const lines: string[] = [
    '-- FoodExpress seed для Neon PostgreSQL',
    '-- Neon → SQL Editor → вставьте всё → Run',
    '',
    'DELETE FROM "SiteBanner";',
    '',
  ];

  const categoryIds: Record<string, string> = {};
  for (const cat of categories) {
    const id = `cat_${cat.slug}`;
    categoryIds[cat.slug] = id;
    const img = categoryImages[cat.slug as keyof typeof categoryImages];
    lines.push(
      `INSERT INTO "Category" ("id", "name", "slug", "image", "sortOrder") VALUES ('${id}', '${esc(cat.name)}', '${cat.slug}', ${img ? `'${esc(img)}'` : 'NULL'}, ${cat.sortOrder}) ON CONFLICT ("slug") DO NOTHING;`
    );
  }

  lines.push(
    `INSERT INTO "User" ("id", "name", "email", "password", "bonusPoints", "isAdmin", "createdAt", "updatedAt") VALUES ` +
      `('user_admin', 'Admin', 'admin@food.ru', '${esc(adminHash)}', 500, true, ${now}, ${now}), ` +
      `('user_test', 'Test User', 'user@food.ru', '${esc(userHash)}', 150, false, ${now}, ${now}) ` +
      `ON CONFLICT ("email") DO UPDATE SET "password" = EXCLUDED."password", "isAdmin" = EXCLUDED."isAdmin";`,
    ''
  );

  let dishIdx = 0;
  for (const rest of restaurantsData) {
    const rid = `rest_${rest.slug}`;
    lines.push(
      `INSERT INTO "Restaurant" ("id", "name", "slug", "description", "image", "coverImage", "rating", "reviewCount", "deliveryTime", "minOrder", "deliveryFee", "cuisineTypes", "address", "isActive", "createdAt", "updatedAt") VALUES (` +
        `'${rid}', '${esc(rest.name)}', '${rest.slug}', '${esc(rest.description)}', '${esc(rest.image)}', '${esc(rest.coverImage)}', ${rest.rating}, ${rest.reviewCount}, ${rest.deliveryTime}, ${rest.minOrder}, ${rest.deliveryFee}, '${esc(JSON.stringify(rest.cuisineTypes))}', '${esc(rest.address)}', true, ${now}, ${now}) ` +
        `ON CONFLICT ("slug") DO NOTHING;`
    );

    for (let i = 0; i < rest.dishes.length; i++) {
      const d = rest.dishes[i];
      const cid = categoryIds[d.categorySlug];
      if (!cid) continue;
      dishIdx += 1;
      const img = categoryImages[d.categorySlug as keyof typeof categoryImages];
      lines.push(
        `INSERT INTO "Dish" ("id", "name", "slug", "description", "price", "image", "weight", "categoryId", "restaurantId", "isAvailable", "sortOrder", "createdAt", "updatedAt") VALUES (` +
          `'dish_${dishIdx}', '${esc(d.name)}', '${d.slug}', '${esc(d.description)}', ${d.price}, ${img ? `'${esc(img)}'` : 'NULL'}, '${esc(d.weight)}', '${cid}', '${rid}', true, ${i + 1}, ${now}, ${now}) ` +
          `ON CONFLICT ("restaurantId", "slug") DO NOTHING;`
      );
    }
  }

  restaurantsData.slice(0, 3).forEach((r, i) => {
    lines.push(
      `INSERT INTO "Favorite" ("id", "userId", "restaurantId") VALUES ('fav_${i + 1}', 'user_test', 'rest_${r.slug}') ON CONFLICT ("userId", "restaurantId") DO NOTHING;`
    );
  });

  lines.push(
    '',
    `INSERT INTO "SiteBanner" ("id", "title", "subtitle", "image", "link", "isActive", "sortOrder", "createdAt", "updatedAt") VALUES`,
    `('banner_1', 'Групповой заказ', 'Соберите команду и закажите вместе', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200', '/group-order', true, 0, ${now}, ${now}),`,
    `('banner_2', 'Бесплатная доставка', 'При заказе от 1500 ₽', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200', '/', true, 1, ${now}, ${now});`,
    '',
    '-- Готово: admin@food.ru / admin123   user@food.ru / user123'
  );

  writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`✓ prisma/.neon-seed.sql (${lines.length} строк)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
