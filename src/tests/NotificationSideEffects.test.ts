/// <reference types="jest" />
import 'reflect-metadata';
import { EntityManager } from 'typeorm';
import { UserModel } from '../models/UserModel';
import { PostService } from '../services/PostService';
import { TransactionService } from '../services/TransactionService';
import { NotifService } from '../services/NotifService';

jest.mock('../firebase', () => ({ firebaseAdmin: {} }));
jest.mock('../repositories', () => ({
  __esModule: true,
  default: { post: () => mockPostRepo, user: () => mockUserRepo, transaction: () => mockTransactionRepo },
  TransactionsManager: class {
    constructor(private manager: any) {}
    readWrite(fn: any) { return this.manager.transaction(fn); }
  },
}));
const mockPostRepo = { getPostById: jest.fn(), markPostAsSold: jest.fn(), archivePost: jest.fn(), getPostWithSaversById: jest.fn() };
const mockUserRepo = { getUserById: jest.fn(), getSavedPostsByUserId: jest.fn(), savePost: jest.fn() };
const mockTransactionRepo = { getTransactionById: jest.fn(), completeTransaction: jest.fn() };
const buyer = { firebaseUid: 'buyer', email: 'buyer@example.com', username: 'Buyer' } as UserModel;
const seller = { firebaseUid: 'seller', email: 'seller@example.com', username: 'Seller', isActive: true };
let committed: boolean;
let manager: EntityManager;
let transaction: any;
let post: any;
let send: jest.SpyInstance;

beforeEach(() => {
  jest.resetAllMocks();
  committed = false;
  manager = { transaction: jest.fn(async (fn: any) => { const result = await fn({}); committed = true; return result; }) } as unknown as EntityManager;
  post = { id: 'post', title: 'Listing', user: seller, images: [] };
  transaction = { id: 'transaction', post, buyer, seller, amount: 10 };
  mockPostRepo.getPostById.mockResolvedValue(post);
  mockUserRepo.getUserById.mockResolvedValue(seller);
  mockUserRepo.getSavedPostsByUserId.mockResolvedValue(buyer);
  mockUserRepo.savePost.mockResolvedValue(post);
  mockTransactionRepo.getTransactionById.mockResolvedValue(transaction);
  mockTransactionRepo.completeTransaction.mockResolvedValue(transaction);
  mockPostRepo.getPostWithSaversById.mockResolvedValue({ savers: [buyer, seller, { firebaseUid: 'saver', email: 'saver@example.com', username: 'Saver' }] });
  send = jest.spyOn(NotifService.prototype, 'sendNotifs').mockImplementation(async () => {
    expect(committed).toBe(true);
    return { message: 'Sent', httpCode: 200, sentCount: 1, failedCount: 0, persistenceFailedCount: 0 };
  });
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('bookmark commits before sending a notification', async () => {
  await expect(new PostService(manager).savePost(buyer, { id: 'post' })).resolves.toBe(post);
  expect(committed).toBe(true);
  expect(send).toHaveBeenCalledTimes(1);
  expect(console.error).not.toHaveBeenCalled();
});

test('bookmark remains successful when notification lookup or transaction throws', async () => {
  send.mockRejectedValue(new Error('Notification database unavailable'));
  await expect(new PostService(manager).savePost(buyer, { id: 'post' })).resolves.toBe(post);
  expect(committed).toBe(true);
  expect(mockUserRepo.savePost).toHaveBeenCalled();
  expect(console.error).toHaveBeenCalled();
});

test.each(['bookmark', 'sale'])('does not send notifications when the %s commit fails', async kind => {
  (manager.transaction as jest.Mock).mockImplementationOnce(async (fn: any) => { await fn({}); throw new Error('Commit failed'); });
  const result = kind === 'bookmark'
    ? new PostService(manager).savePost(buyer, { id: 'post' })
    : new TransactionService(manager).completeTransaction({ id: 'transaction' }, { completed: true });
  await expect(result).rejects.toThrow('Commit failed');
  expect(send).not.toHaveBeenCalled();
});

test('sale commits and deduplicates recipients before notifying', async () => {
  await expect(new TransactionService(manager).completeTransaction({ id: 'transaction' }, { completed: true })).resolves.toBe(transaction);
  expect(send.mock.calls.map(call => call[0].email)).toEqual(['buyer@example.com', 'seller@example.com', 'saver@example.com']);
  expect(mockPostRepo.archivePost).toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});

test('one failed recipient does not fail a sale or stop the remaining recipients', async () => {
  send.mockRejectedValueOnce(new Error('Buyer notification failed'));
  await expect(new TransactionService(manager).completeTransaction({ id: 'transaction' }, { completed: true })).resolves.toBe(transaction);
  expect(committed).toBe(true);
  expect(send).toHaveBeenCalledTimes(3);
  expect(console.error).toHaveBeenCalled();
});
