import { neon } from '@neondatabase/serverless';
import { Client } from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Set DATABASE_URL');
  process.exit(1);
}

console.log('Testing pg...');
const pg = new Client({ connectionString: url });
try {
  await pg.connect();
  const r = await pg.query('SELECT 1 AS ok');
  console.log('pg OK', r.rows[0]);
  await pg.end();
} catch (e) {
  console.error('pg FAIL', e instanceof Error ? e.message : e);
}

console.log('Testing neon serverless...');
try {
  const sql = neon(url);
  const rows = await sql`SELECT 1 AS ok`;
  console.log('neon OK', rows[0]);
} catch (e) {
  console.error('neon FAIL', e instanceof Error ? e.message : e);
}
