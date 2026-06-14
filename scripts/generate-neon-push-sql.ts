/**
 * Генерирует prisma/.neon-push.sql — безопасно для повторного запуска в Neon SQL Editor
 */
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..');
const outPath = join(root, 'prisma', '.neon-push.sql');

function makeIdempotent(sql: string) {
  let result = sql;

  result = result.replace(
    /CREATE TYPE "([^"]+)" AS ENUM \(([^;]+)\);/g,
    (_match, name, values) =>
      `DO $$ BEGIN CREATE TYPE "${name}" AS ENUM (${values}); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`
  );

  result = result.replace(/CREATE TABLE "/g, 'CREATE TABLE IF NOT EXISTS "');

  result = result.replace(/CREATE UNIQUE INDEX "/g, 'CREATE UNIQUE INDEX IF NOT EXISTS "');
  result = result.replace(/CREATE INDEX "/g, 'CREATE INDEX IF NOT EXISTS "');

  result = result.replace(
    /ALTER TABLE "([^"]+)" ADD CONSTRAINT "([^"]+)" ((?:FOREIGN KEY|PRIMARY KEY|UNIQUE)[^;]+);/g,
    (_match, table, constraint, definition) =>
      `DO $$ BEGIN ALTER TABLE "${table}" ADD CONSTRAINT "${constraint}" ${definition}; EXCEPTION WHEN duplicate_object THEN NULL; END $$;`
  );

  return [
    '-- FoodExpress schema для Neon PostgreSQL',
    '-- Безопасно запускать повторно (IF NOT EXISTS / duplicate_object)',
    '-- Neon → SQL Editor → Run',
    '',
    result.trim(),
    '',
  ].join('\n');
}

function main() {
  const raw = execSync(
    'npx cross-env PRISMA_PROVIDER=postgresql DATABASE_URL=postgresql://local:local@127.0.0.1/local prisma migrate diff --from-empty --to-schema prisma/schema.postgresql.prisma --script',
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }
  );

  writeFileSync(outPath, makeIdempotent(raw), 'utf8');
  console.log(`✓ prisma/.neon-push.sql (idempotent, ${raw.length} bytes)`);
}

main();
