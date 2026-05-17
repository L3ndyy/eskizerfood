import { execSync } from 'child_process';

// На Vercel клиент для Postgres соберётся в build:vercel
if (process.env.VERCEL) {
  console.log('postinstall: skip (Vercel → build:vercel сделает prisma generate)');
} else {
  execSync('prisma generate', { stdio: 'inherit' });
}
