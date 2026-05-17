/**
 * npm run dist — лёгкая сборка + один ZIP для загрузки в Timeweb
 */
import { execSync } from 'child_process';
import {
  cpSync,
  mkdirSync,
  rmSync,
  existsSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const appDir = join(distDir, 'app');
const standalone = join(root, '.next', 'standalone');
const zipPath = join(distDir, 'foodexpress.zip');

const buildEnv = {
  ...process.env,
  PRISMA_PROVIDER: 'mysql',
  DATABASE_URL: 'mysql://build:build@127.0.0.1:3306/build',
  NODE_ENV: 'production',
};

function run(cmd) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { cwd: root, stdio: 'inherit', env: buildEnv });
}

function dirSizeMB(dir) {
  let sum = 0;
  let count = 0;
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else {
        sum += st.size;
        count += 1;
      }
    }
  };
  if (existsSync(dir)) walk(dir);
  return { mb: Math.round((sum / 1024 / 1024) * 10) / 10, count };
}

/** Удаляем то, что не нужно на сервере (MySQL) */
function pruneApp() {
  const dirs = [
    'node_modules/typescript',
    'node_modules/@types',
    'node_modules/better-sqlite3',
    'node_modules/@prisma/adapter-better-sqlite3',
    'node_modules/eslint',
  ];
  for (const rel of dirs) {
    const p = join(appDir, rel);
    if (existsSync(p)) {
      rmSync(p, { recursive: true, force: true });
      console.log(`  − ${rel}`);
    }
  }

  const stripMaps = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) stripMaps(p);
      else if (name.endsWith('.map')) unlinkSync(p);
    }
  };
  stripMaps(appDir);
}

function createZip() {
  if (existsSync(zipPath)) rmSync(zipPath);
  // tar есть в Windows 10+ — один архив вместо тысяч файлов в менеджере
  execSync(`tar -a -cf "${zipPath}" -C "${appDir}" .`, { cwd: root, stdio: 'inherit' });
}

console.log('=== FoodExpress: сборка dist/ (облегчённая) ===\n');

if (!existsSync(join(root, 'deploy', 'timeweb.sql'))) {
  execSync('npx tsx scripts/generate-timeweb-sql.ts', { cwd: root, stdio: 'inherit' });
}

run('npx prisma generate --schema=prisma/schema.mysql.prisma');
run('npx next build');

console.log('\nСборка папки dist/app...');
if (existsSync(distDir)) rmSync(distDir, { recursive: true });
mkdirSync(appDir, { recursive: true });

cpSync(standalone, appDir, { recursive: true });
cpSync(join(root, 'public'), join(appDir, 'public'), { recursive: true });
cpSync(join(root, '.next', 'static'), join(appDir, '.next', 'static'), { recursive: true });

console.log('\nОчистка лишнего...');
pruneApp();

// .env не кладём в архив — создаётся на сервере вручную
const envInApp = join(appDir, '.env');
if (existsSync(envInApp)) {
  rmSync(envInApp);
  console.log('  − .env (не включаем в zip — создайте на сервере)');
}

cpSync(join(root, 'deploy', 'timeweb.sql'), join(distDir, 'timeweb.sql'));
cpSync(join(root, 'deploy', 'env.server.example'), join(distDir, 'env.server.example'));
writeFileSync(join(distDir, 'КАК-ЗАГРУЗИТЬ.txt'), readFileSync(join(root, 'deploy', 'КАК-ЗАГРУЗИТЬ.txt'), 'utf8'));

console.log('\nАрхив foodexpress.zip...');
createZip();

const appStats = dirSizeMB(appDir);
const zipMb = Math.round((statSync(zipPath).size / 1024 / 1024) * 10) / 10;

console.log('\n✓ Готово!\n');
console.log(`  Папка app/:  ${appStats.mb} МБ (${appStats.count} файлов)`);
console.log(`  Архив:       ${zipMb} МБ  ← загружайте ЭТОТ файл\n`);
console.log('  1. dist/timeweb.sql        → phpMyAdmin → SQL');
console.log('  2. dist/foodexpress.zip    → файловый менеджер → распаковать');
console.log('  3. .env рядом с server.js  (см. env.server.example)\n');
