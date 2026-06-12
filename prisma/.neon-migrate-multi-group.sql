-- Миграция для мультиресторанного группового заказа
-- Neon → SQL Editor → Run (после .neon-push.sql)

ALTER TABLE "GroupSession" ALTER COLUMN "restaurantId" DROP NOT NULL;

ALTER TABLE "GroupCartItem" ADD COLUMN IF NOT EXISTS "restaurantId" TEXT;
ALTER TABLE "GroupCartItem" ADD COLUMN IF NOT EXISTS "restaurantName" TEXT;

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

CREATE INDEX IF NOT EXISTS "GroupCartItem_restaurantId_idx" ON "GroupCartItem"("restaurantId");
