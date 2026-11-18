// Run through the npm command so the existing TypeScript embedding service loads.
const MISSING = '(embedding IS NULL OR cardinality(embedding) = 0)';

async function backfill(client, embed, { dryRun = false, limit = Infinity, log = console.log, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
  const counts = await client.query(`SELECT count(*) AS missing FROM "Post" WHERE ${MISSING}`);
  log(`Posts missing embeddings: ${counts.rows[0].missing}`);
  const result = { saved: 0, failed: 0, skipped: 0 };
  if (dryRun) return result;
  let cursor = null;
  let processed = 0;
  while (processed < limit) {
    const { rows } = await client.query(
      `SELECT id, title, description FROM "Post" WHERE ${MISSING}
       AND ($1::uuid IS NULL OR id > $1::uuid) ORDER BY id LIMIT $2`,
      [cursor, Math.min(25, limit - processed)],
    );
    if (!rows.length) break;
    for (const post of rows) {
      cursor = post.id;
      processed++;
      const text = `${post.title || ''} ${post.description || ''}`.trim();
      let vector = null;
      if (text) {
        for (let attempt = 0; attempt < 3; attempt++) {
          vector = await embed(text);
          if (Array.isArray(vector) && vector.length === 512 && vector.every(Number.isFinite)) break;
          vector = null;
          if (attempt < 2) await sleep(1000 * 2 ** attempt);
        }
      }
      if (!vector) {
        result.failed++;
        log(`Failed: ${post.id}; left missing for a later retry.`);
        continue;
      }
      // Do not overwrite another worker's embedding or embed an outdated title/description.
      const updated = await client.query(
        `UPDATE "Post" SET embedding = $2::float[], "similarPostIds" = NULL
         WHERE id = $1 AND ${MISSING}
         AND title IS NOT DISTINCT FROM $3 AND description IS NOT DISTINCT FROM $4`,
        [post.id, vector, post.title, post.description],
      );
      if (updated.rowCount) result.saved++;
      else result.skipped++;
      log(`Processed ${processed}: saved=${result.saved}, failed=${result.failed}, skipped=${result.skipped}`);
    }
  }
  return result;
}

async function main() {
  require('dotenv').config();
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('npm run embeddings:backfill -- [--dry-run] [--limit N]');
    return;
  }
  let dryRun = false;
  let limit = Infinity;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--limit') {
      limit = Number(args[++i]);
      if (!Number.isSafeInteger(limit) || limit <= 0) throw new Error('--limit must be a positive integer');
    } else throw new Error(`Unknown argument: ${args[i]}`);
  }
  if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL in .env');
  if (!dryRun && !process.env.OPENAI_API_KEY) throw new Error('Set OPENAI_API_KEY in .env');
  if (!dryRun && process.env.NODE_ENV === 'test') throw new Error('Embedding generation is disabled with NODE_ENV=test');
  const url = new URL(process.env.DATABASE_URL);
  console.log(`Target: ${url.hostname}${url.pathname}${dryRun ? ' (dry run; no API calls or writes)' : ''}`);
  const { Client } = require('pg');
  const { embedText } = require('../src/utils/EmbeddingService');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 15000,
    statement_timeout: 30000,
    ...(!url.searchParams.has('sslmode') && url.hostname.endsWith('.neon.tech') ? { ssl: true } : {}),
  });
  try {
    await client.connect();
    const result = await backfill(client, embedText, { dryRun, limit });
    console.log('Backfill complete:', result);
    if (result.failed) process.exitCode = 1;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Backfill failed:', error.message);
    process.exitCode = 1;
  });
}
module.exports = { backfill };
