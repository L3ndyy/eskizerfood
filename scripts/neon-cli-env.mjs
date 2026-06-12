import { spawnSync } from 'child_process';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';
import path from 'path';

neonConfig.webSocketConstructor = ws;

/**
 * Neon pooler + channel_binding often break Prisma TCP CLI on Windows.
 * Normalize URL for logging; Neon serverless driver uses WebSocket (works when TCP fails).
 */
function normalizeNeonUrl(url) {
  if (!url) return url;

  let normalized = url.replace('-pooler', '');

  try {
    const parsed = new URL(normalized);
    parsed.searchParams.delete('channel_binding');
    if (!parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require');
    }
    normalized = parsed.toString();
  } catch {
    normalized = normalized
      .replace(/([?&])channel_binding=[^&]*&?/g, '$1')
      .replace(/[?&]$/, '');
  }

  return normalized;
}

function splitSqlStatements(script) {
  return script
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function runStatement(pool, statement, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await pool.query(statement);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/already exists|duplicate key|42710|42P07|42P06/i.test(message)) {
        return 'skip';
      }
      if (attempt === retries || !/fetch failed|ECONNRESET|terminated unexpectedly/i.test(message)) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
}

async function pushViaNeonWebSocket(url) {
  const schemaPath = 'prisma/schema.postgresql.prisma';
  const sqlPath = path.join('prisma', '.neon-push.sql');

  console.log('TCP недоступен — применяем схему через Neon WebSocket...');

  const diff = spawnSync(
    'npx',
    [
      'cross-env',
      'PRISMA_PROVIDER=postgresql',
      'prisma',
      'migrate',
      'diff',
      '--from-empty',
      '--to-schema',
      schemaPath,
      '--script',
      '-o',
      sqlPath,
    ],
    { stdio: 'inherit', shell: true, env: process.env }
  );

  if (diff.status !== 0) {
    throw new Error('Не удалось сгенерировать SQL-схему (prisma migrate diff).');
  }

  const script = fs.readFileSync(sqlPath, 'utf8');
  const statements = splitSqlStatements(script);
  const pool = new Pool({ connectionString: url });

  let applied = 0;
  let skipped = 0;

  try {
    for (const statement of statements) {
      const result = await runStatement(pool, statement);
      if (result === 'skip') {
        skipped += 1;
      } else {
        applied += 1;
      }
    }
  } finally {
    await pool.end();
  }

  console.log(`Схема применена: ${applied} команд, пропущено (уже есть): ${skipped}.`);
  fs.unlinkSync(sqlPath);
}

async function pushDatabase(url) {
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return '(unknown)';
    }
  })();

  console.log(`Neon CLI: host ${host}`);

  const tcpPush = spawnSync(
    'npx',
    [
      'cross-env',
      'PRISMA_PROVIDER=postgresql',
      'prisma',
      'db',
      'push',
      '--schema=prisma/schema.postgresql.prisma',
    ],
    { stdio: 'pipe', shell: true, env: process.env, encoding: 'utf8' }
  );

  if (tcpPush.status === 0) {
    process.stdout.write(tcpPush.stdout ?? '');
    process.stderr.write(tcpPush.stderr ?? '');
    return;
  }

  const output = `${tcpPush.stdout ?? ''}\n${tcpPush.stderr ?? ''}`;
  if (!/P1001|Can't reach database|ECONNRESET/i.test(output)) {
    process.stdout.write(tcpPush.stdout ?? '');
    process.stderr.write(tcpPush.stderr ?? '');
    process.exit(tcpPush.status ?? 1);
  }

  await pushViaNeonWebSocket(url);
}

const mode = process.argv[2];
const rawUrl = process.env.DATABASE_URL;

if (!rawUrl) {
  console.error('DATABASE_URL не задан. Vercel → Settings → Environment Variables.');
  process.exit(1);
}

const directUrl = normalizeNeonUrl(rawUrl);
process.env.DATABASE_URL = directUrl;
process.env.PRISMA_PROVIDER = 'postgresql';

const run = (command, args) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  process.exit(result.status ?? 1);
};

if (mode === 'push') {
  try {
    await pushDatabase(directUrl);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
  process.exit(0);
}

if (mode === 'seed') {
  const gen = spawnSync(
    'npx',
    [
      'cross-env',
      'PRISMA_PROVIDER=postgresql',
      'prisma',
      'generate',
      '--schema=prisma/schema.postgresql.prisma',
    ],
    { stdio: 'inherit', shell: true, env: process.env }
  );
  if (gen.status !== 0) process.exit(gen.status ?? 1);

  const seed = spawnSync(
    'npx',
    ['cross-env', 'PRISMA_PROVIDER=postgresql', 'tsx', 'prisma/seed.ts'],
    { stdio: 'inherit', shell: true, env: process.env }
  );
  process.exit(seed.status ?? 1);
}

console.error('Usage: node scripts/neon-cli-env.mjs push|seed');
process.exit(1);
