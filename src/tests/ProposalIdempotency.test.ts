/// <reference types="jest" />
import 'reflect-metadata';
import { ChatController } from '../api/controllers/ChatController';
import { UserModel } from '../models/UserModel';
import { proposalAcceptanceId } from '../utils/proposalAcceptanceId';

jest.mock('firebase-admin/firestore', () => ({ getFirestore: () => ({
  collection: () => ({ doc: (id: string) => mockFirestore.collection().doc(id) }),
  runTransaction: (fn: any) => mockFirestore.runTransaction(fn),
}) }));
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  getManager: () => ({ findOne: async (model: any, where: any) => model === UserModel ? mockUsers[where.firebaseUid] : mockPost }),
  getConnection: () => ({ createQueryRunner: () => makeQueryRunner() }),
}));
jest.mock('../services/NotifService', () => ({ NotifService: class { sendNotifsSafely = mockNotify; } }));

const { Client } = require('pg');
const socket = process.env.PROPOSAL_TEST_PG_SOCKET;
// Opt-in integration test: never use an application DATABASE_URL or a shared DB.
const integration = socket ? describe : describe.skip;
const mockUsers: Record<string, any> = {
  buyer: { firebaseUid: 'buyer', email: 'buyer@example.com', username: 'Buyer' },
  seller: { firebaseUid: 'seller', email: 'seller@example.com', username: 'Seller' },
};
const mockPost = { id: 'listing', title: 'Listing', originalPrice: 10, alteredPrice: null as number | null, images: [] };
const mockNotify = jest.fn();
const messages = new Map<string, any>();
let firestoreTail: Promise<unknown> = Promise.resolve();
let firestoreFailure: 'before' | 'after' | undefined;
const chatData = { buyerID: 'buyer', sellerID: 'seller', listingID: 'listing', userIDs: ['buyer', 'seller'] };
const mockFirestore = {
  collection: () => ({ doc: (id: string) => ({
    get: async () => ({ exists: true, data: () => chatData }),
    collection: () => ({ doc: (messageId: string) => ({ key: `${id}/${messageId}` }) }),
  }) }),
  // Model Firestore's serialized transaction semantics; SQL below is real Postgres.
  runTransaction: (fn: any) => {
    const run = firestoreTail.then(async () => {
      if (firestoreFailure === 'before') { firestoreFailure = undefined; throw new Error('Firestore unavailable'); }
      const writes = new Map<string, any>();
      const result = await fn({
        get: async (ref: any) => ({ exists: messages.has(ref.key), data: () => messages.get(ref.key) }),
        create: (ref: any, value: any) => writes.set(ref.key, { ...value }),
        update: () => {},
      });
      writes.forEach((value, key) => messages.set(key, value));
      if (firestoreFailure === 'after') { firestoreFailure = undefined; throw new Error('Firestore commit response lost'); }
      return result;
    });
    firestoreTail = run.catch(() => {});
    return run;
  },
};

function client() {
  if (!socket?.startsWith('/tmp/resell-idempotency.')) throw new Error('Use a dedicated temporary Postgres socket');
  return new Client({ host: socket, port: 55439, database: 'postgres', user: process.env.USER });
}
function makeQueryRunner() {
  const connection = client();
  return {
    isTransactionActive: false,
    connect: () => connection.connect(),
    async startTransaction() { await connection.query('BEGIN ISOLATION LEVEL READ COMMITTED'); this.isTransactionActive = true; },
    query: async (sql: string, values: any[]) => (await connection.query(sql, values)).rows,
    async commitTransaction() { await connection.query('COMMIT'); this.isTransactionActive = false; },
    async rollbackTransaction() { await connection.query('ROLLBACK'); this.isTransactionActive = false; },
    release: () => connection.end(),
  };
}
const start = '2026-11-20T15:00:00.000Z';
const end = '2026-11-20T16:00:00.000Z';
const acceptance = (overrides: any = {}, chatId = 'chat') => new ChatController().respondProposal(
  mockUsers.seller, { id: chatId }, { senderId: 'seller', accepted: true, startDate: start, endDate: end, ...overrides } as any,
);

integration('proposal acceptance with isolated Postgres', () => {
  let db: any;
  beforeAll(async () => {
    const connection = client(); await connection.connect(); db = connection;
    await db.query(`CREATE TABLE "Transaction" (
      id uuid PRIMARY KEY, location text, amount numeric, completed boolean,
      "postId" text, "buyerId" text, "sellerId" text, "transactionDate" timestamptz,
      "confirmationSent" boolean, "createdAt" timestamptz NOT NULL DEFAULT now()
    )`);
  });
  beforeEach(async () => {
    await db.query('TRUNCATE "Transaction"');
    messages.clear(); mockNotify.mockReset(); firestoreFailure = undefined;
    mockPost.alteredPrice = null;
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => { if (db) { await db.query('DROP TABLE IF EXISTS "Transaction"'); await db.end(); } });

  test('identical retries preserve ID, timestamp, amount and completion, without another message/push', async () => {
    const first = await acceptance();
    await db.query('UPDATE "Transaction" SET completed = true WHERE id = $1', [first.transactionId]);
    mockPost.alteredPrice = 99;
    const retry = await acceptance();
    expect(retry).toEqual(first);
    const rows = (await db.query('SELECT * FROM "Transaction"')).rows;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ amount: '10', completed: true });
    expect(messages.size).toBe(1); expect(mockNotify).toHaveBeenCalledTimes(1);
  });

  test('retry repairs a Firestore failure after Postgres committed', async () => {
    firestoreFailure = 'before';
    await expect(acceptance()).rejects.toThrow('Firestore unavailable');
    const existing = (await db.query('SELECT id FROM "Transaction"')).rows[0].id;
    expect(messages.size).toBe(0); expect(mockNotify).not.toHaveBeenCalled();
    expect((await acceptance()).transactionId).toBe(existing);
    expect((await db.query('SELECT id FROM "Transaction"')).rows).toHaveLength(1);
    expect(messages.size).toBe(1); expect(mockNotify).toHaveBeenCalledTimes(1);
  });

  test('lost Firestore commit acknowledgement does not duplicate data on retry', async () => {
    firestoreFailure = 'after';
    await expect(acceptance()).rejects.toThrow('commit response lost');
    await acceptance();
    expect((await db.query('SELECT id FROM "Transaction"')).rows).toHaveLength(1);
    expect(messages.size).toBe(1);
    // Pushes remain best effort; no replay after an ambiguous Firestore acknowledgement.
    expect(mockNotify).not.toHaveBeenCalled();
  });

  test('eight simultaneous requests create one SQL row, one message and one push', async () => {
    const results = await Promise.all(Array.from({ length: 8 }, () => acceptance()));
    expect(new Set(results.map(r => r.transactionId)).size).toBe(1);
    expect((await db.query('SELECT id FROM "Transaction"')).rows).toHaveLength(1);
    expect(messages.size).toBe(1); expect(mockNotify).toHaveBeenCalledTimes(1);
  });

  test('equivalent timezone representations identify the same acceptance', async () => {
    const first = await acceptance();
    const retry = await acceptance({ startDate: '2026-11-20T10:00:00-05:00', endDate: '2026-11-20T11:00:00-05:00' });
    expect(retry).toEqual(first); expect(mockNotify).toHaveBeenCalledTimes(1);
  });

  test('different chats or meeting intervals create different acceptances', async () => {
    const results = await Promise.all([
      acceptance(), acceptance({}, 'other-chat'),
      acceptance({ endDate: '2026-11-20T17:00:00Z' }),
    ]);
    expect(new Set(results.map(r => r.transactionId)).size).toBe(3);
    expect((await db.query('SELECT id FROM "Transaction"')).rows).toHaveLength(3);
  });

  test('invalid interval and spoofed sender are rejected before any writes', async () => {
    await expect(acceptance({ endDate: start })).rejects.toThrow('valid meeting interval');
    await expect(acceptance({ startDate: 'not-a-date' })).rejects.toThrow('valid meeting interval');
    await expect(acceptance({ senderId: 'buyer' })).rejects.toThrow('authenticated user');
    expect((await db.query('SELECT id FROM "Transaction"')).rows).toHaveLength(0);
    expect(messages.size).toBe(0);
  });
});

test('acceptance IDs are stable UUIDv5 values with normalized dates', () => {
  const id = proposalAcceptanceId('chat', 'buyer', 'seller', 'listing', new Date(start), new Date(end));
  expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  expect(proposalAcceptanceId('chat', 'buyer', 'seller', 'listing', new Date(start), new Date(end))).toBe(id);
});
