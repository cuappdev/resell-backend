const { test } = require('node:test');
const assert = require('node:assert/strict');
const { backfill } = require('./backfill-embeddings');
const vector = Array(512).fill(0.1);
const post = { id: '00000000-0000-0000-0000-000000000001', title: 'Desk', description: 'Wood' };
const options = { log: () => {}, sleep: async () => {} };

test('dry run only reads the count and never embeds or writes', async () => {
  let calls = 0;
  const client = { query: async (sql) => {
    calls++;
    assert.match(sql, /SELECT count/);
    return { rows: [{ missing: '1' }] };
  } };
  await backfill(client, () => assert.fail('Unexpected API call'), { ...options, dryRun: true });
  assert.equal(calls, 1);
});

test('retries invalid vectors, saves guarded update, and respects limit', async () => {
  let attempts = 0;
  let calls = 0;
  const client = { query: async (sql, params) => {
    calls++;
    if (calls === 1) return { rows: [{ missing: '10' }] };
    if (calls === 2) {
      assert.equal(params[1], 1);
      return { rows: [post] };
    }
    assert.match(sql, /embedding IS NULL/);
    assert.match(sql, /title IS NOT DISTINCT FROM/);
    assert.match(sql, /"similarPostIds" = NULL/);
    assert.deepEqual(params, [post.id, vector, post.title, post.description]);
    return { rowCount: 1 };
  } };
  const result = await backfill(client, async (text) => {
    assert.equal(text, 'Desk Wood');
    return ++attempts < 3 ? [NaN] : vector;
  }, { ...options, limit: 1 });
  assert.deepEqual(result, { saved: 1, failed: 0, skipped: 0 });
  assert.equal(attempts, 3);
  assert.equal(calls, 3);
});

test('failed generation stays missing and cursor advances without writing', async () => {
  let calls = 0;
  const client = { query: async (sql, params) => {
    assert.doesNotMatch(sql, /UPDATE/);
    if (++calls === 1) return { rows: [{ missing: '1' }] };
    if (calls === 2) return { rows: [post] };
    assert.equal(params[0], post.id);
    return { rows: [] };
  } };
  assert.deepEqual(await backfill(client, async () => null, options), { saved: 0, failed: 1, skipped: 0 });
});

test('concurrently updated posts count as skipped', async () => {
  let calls = 0;
  const client = { query: async () => {
    if (++calls === 1) return { rows: [{ missing: '1' }] };
    if (calls === 2) return { rows: [post] };
    return { rowCount: 0 };
  } };
  assert.deepEqual(await backfill(client, async () => vector, { ...options, limit: 1 }), { saved: 0, failed: 0, skipped: 1 });
});
