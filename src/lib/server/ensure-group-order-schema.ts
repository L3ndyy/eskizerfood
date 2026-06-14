import { prisma } from '@/lib/prisma';

let ensured = false;

/** Applies group-order DB columns on Neon if migration SQL was not run manually. */
export async function ensureGroupOrderSchema() {
  if (ensured) return;

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GroupSession" ALTER COLUMN "restaurantId" DROP NOT NULL;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GroupCartItem" ADD COLUMN IF NOT EXISTS "restaurantId" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GroupCartItem" ADD COLUMN IF NOT EXISTS "restaurantName" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      UPDATE "GroupCartItem" gci
      SET
        "restaurantId" = gs."restaurantId",
        "restaurantName" = r."name"
      FROM "GroupSession" gs
      JOIN "Restaurant" r ON r."id" = gs."restaurantId"
      WHERE gci."groupSessionId" = gs."id"
        AND gci."restaurantId" IS NULL
        AND gs."restaurantId" IS NOT NULL;
    `);
    await prisma.$executeRawUnsafe(`
      UPDATE "GroupCartItem"
      SET "restaurantId" = 'unknown', "restaurantName" = 'Ресторан'
      WHERE "restaurantId" IS NULL;
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "GroupCartItem_restaurantId_idx" ON "GroupCartItem"("restaurantId");
    `);
  } catch (error) {
    console.warn('ensureGroupOrderSchema:', error);
  }

  ensured = true;
}

export async function getAnchorRestaurantId() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { isActive: true },
    select: { id: true },
    orderBy: { name: 'asc' },
  });
  return restaurant?.id ?? null;
}
