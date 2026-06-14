import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

let migrationAttempted = false;
let migrationOk = false;

async function tableExists(name: string) {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${name}
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

async function columnExists(table: string, column: string) {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${table}
        AND column_name = ${column}
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

export async function groupOrderTablesExist() {
  const hasSession = await tableExists('GroupSession');
  const hasParticipant = await tableExists('GroupParticipant');
  return hasSession && hasParticipant;
}

export async function groupCartHasRestaurantColumns() {
  const hasRestaurantId = await columnExists('GroupCartItem', 'restaurantId');
  const hasRestaurantName = await columnExists('GroupCartItem', 'restaurantName');
  return hasRestaurantId && hasRestaurantName;
}

/** Applies group-order DB columns on Neon if migration SQL was not run manually. */
export async function ensureGroupOrderSchema() {
  if (migrationOk) return true;
  if (migrationAttempted) return migrationOk;

  migrationAttempted = true;

  if (!(await groupOrderTablesExist())) {
    return false;
  }

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
    migrationOk = true;
  } catch (error) {
    console.warn('ensureGroupOrderSchema:', error);
    migrationOk = await groupCartHasRestaurantColumns();
  }

  return migrationOk;
}

export async function getAnchorRestaurantId() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { isActive: true },
    select: { id: true },
    orderBy: { name: 'asc' },
  });
  return restaurant?.id ?? null;
}

type PreparedCartItem = {
  userId: string;
  dishId: string;
  dishName: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
};

export async function createGroupCartItem(
  groupSessionId: string,
  item: PreparedCartItem,
  useExtendedColumns: boolean
) {
  if (useExtendedColumns) {
    await prisma.groupCartItem.create({
      data: {
        groupSessionId,
        userId: item.userId,
        dishId: item.dishId,
        dishName: item.dishName,
        price: item.price,
        quantity: item.quantity,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
      },
    });
    return;
  }

  const id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO "GroupCartItem" (
      "id", "groupSessionId", "userId", "dishId", "dishName", "price", "quantity"
    ) VALUES (
      ${id}, ${groupSessionId}, ${item.userId}, ${item.dishId},
      ${item.dishName}, ${item.price}, ${item.quantity}
    )
  `;
}
