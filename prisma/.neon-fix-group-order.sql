-- Дозаполнение схемы группового заказа (Neon SQL Editor → Run)
-- Запускайте если push.sql уже выполнялся, но групповой заказ всё ещё падает.

DO $$ BEGIN CREATE TYPE "GroupPaymentMode" AS ENUM ('CENTRALIZED', 'SPLIT'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "GroupSessionStatus" AS ENUM ('ACTIVE', 'CLOSED', 'EXPIRED', 'COMPLETED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "GroupSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "initiatorUserId" TEXT NOT NULL,
    "restaurantId" TEXT,
    "status" "GroupSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "paymentMode" "GroupPaymentMode",
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GroupParticipant" (
    "id" TEXT NOT NULL,
    "groupSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "hasPaid" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GroupCartItem" (
    "id" TEXT NOT NULL,
    "groupSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "dishName" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "modifiers" TEXT,
    "restaurantId" TEXT,
    "restaurantName" TEXT,
    CONSTRAINT "GroupCartItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "GroupSession" ADD COLUMN IF NOT EXISTS "status" "GroupSessionStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "GroupSession" ADD COLUMN IF NOT EXISTS "paymentMode" "GroupPaymentMode";
ALTER TABLE "GroupSession" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "GroupSession" ALTER COLUMN "restaurantId" DROP NOT NULL;

ALTER TABLE "GroupCartItem" ADD COLUMN IF NOT EXISTS "restaurantId" TEXT;
ALTER TABLE "GroupCartItem" ADD COLUMN IF NOT EXISTS "restaurantName" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "GroupSession_token_key" ON "GroupSession"("token");
CREATE INDEX IF NOT EXISTS "GroupSession_initiatorUserId_idx" ON "GroupSession"("initiatorUserId");
CREATE INDEX IF NOT EXISTS "GroupSession_restaurantId_idx" ON "GroupSession"("restaurantId");
CREATE INDEX IF NOT EXISTS "GroupParticipant_groupSessionId_idx" ON "GroupParticipant"("groupSessionId");
CREATE UNIQUE INDEX IF NOT EXISTS "GroupParticipant_groupSessionId_userId_key" ON "GroupParticipant"("groupSessionId", "userId");
CREATE INDEX IF NOT EXISTS "GroupCartItem_groupSessionId_idx" ON "GroupCartItem"("groupSessionId");
CREATE INDEX IF NOT EXISTS "GroupCartItem_restaurantId_idx" ON "GroupCartItem"("restaurantId");

DO $$ BEGIN ALTER TABLE "GroupSession" ADD CONSTRAINT "GroupSession_initiatorUserId_fkey" FOREIGN KEY ("initiatorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "GroupSession" ADD CONSTRAINT "GroupSession_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_groupSessionId_fkey" FOREIGN KEY ("groupSessionId") REFERENCES "GroupSession"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "GroupCartItem" ADD CONSTRAINT "GroupCartItem_groupSessionId_fkey" FOREIGN KEY ("groupSessionId") REFERENCES "GroupSession"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "GroupCartItem" ADD CONSTRAINT "GroupCartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

UPDATE "GroupCartItem" gci
SET
  "restaurantId" = gs."restaurantId",
  "restaurantName" = r."name"
FROM "GroupSession" gs
JOIN "Restaurant" r ON r."id" = gs."restaurantId"
WHERE gci."groupSessionId" = gs."id"
  AND gci."restaurantId" IS NULL
  AND gs."restaurantId" IS NOT NULL;

UPDATE "GroupCartItem"
SET "restaurantId" = 'unknown', "restaurantName" = 'Ресторан'
WHERE "restaurantId" IS NULL;

ALTER TABLE "GroupCartItem" ALTER COLUMN "restaurantId" SET NOT NULL;
ALTER TABLE "GroupCartItem" ALTER COLUMN "restaurantName" SET NOT NULL;

-- Проверка (должно вернуть 3 строки: GroupSession, GroupParticipant, GroupCartItem)
SELECT tablename FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('GroupSession', 'GroupParticipant', 'GroupCartItem')
ORDER BY tablename;
