/// <reference types="jest" />

import 'reflect-metadata';
import { ChatController } from '../api/controllers/ChatController';
import { UserModel } from '../models/UserModel';
import { CreateChatMessage } from '../types';

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({ collection: () => ({ doc: () => mockDoc }) }),
}));
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  getManager: () => ({ findOne: mockFindUser }),
  getConnection: () => ({ createQueryRunner: () => mockQueryRunner }),
}));
jest.mock('../services/NotifService', () => ({
  NotifService: class { sendNotifs = mockSend; sendNotifsSafely = mockSend; },
}));

const mockQueryRunner = {
  connect: jest.fn(), startTransaction: jest.fn(), query: jest.fn(),
  commitTransaction: jest.fn(), rollbackTransaction: jest.fn(), release: jest.fn(),
};
const mockAdd = jest.fn();
const mockDoc = {
  get: jest.fn(), set: jest.fn(), update: jest.fn(),
  collection: () => ({ add: mockAdd }),
};
const mockFindUser = jest.fn();
const mockSend = jest.fn();
const storedChat = {
  buyerID: 'buyer', sellerID: 'seller', listingID: 'listing', userIDs: ['buyer', 'seller'],
};
const user = { firebaseUid: 'buyer', username: 'Buyer', photoUrl: '' } as UserModel;
const body: CreateChatMessage = {
  type: 'message', buyerId: 'buyer', sellerId: 'seller', listingId: 'listing',
  senderId: 'buyer', text: 'Is this available?', images: [],
};
const controller = new ChatController();
const send = (overrides: Partial<CreateChatMessage> = {}, sender = user) =>
  controller.postChat(sender, { id: 'chat' }, { ...body, ...overrides });

beforeEach(() => {
  jest.resetAllMocks();
  mockDoc.get.mockResolvedValue({ exists: true, data: () => storedChat });
  mockAdd.mockResolvedValue({ id: 'message' });
  mockFindUser.mockResolvedValue({ email: 'recipient@example.com' });
  mockSend.mockResolvedValue({ sentCount: 1, failedCount: 0, persistenceFailedCount: 0 });
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('notifies the stored recipient with chat routing data after saving', async () => {
  const response = await send({ sellerId: 'forged-recipient', listingId: 'forged-listing' });
  expect(response.text).toBe(body.text);
  expect(mockFindUser).toHaveBeenCalledWith(UserModel, { firebaseUid: 'seller' });
  expect(mockSend).toHaveBeenCalledWith({
    email: 'recipient@example.com', title: 'Buyer', body: body.text,
    data: { type: 'messages', chatId: 'chat', postId: 'listing', senderId: 'buyer', senderUsername: 'Buyer', senderPhotoUrl: '' },
  });
  expect(mockDoc.update.mock.invocationCallOrder[1]).toBeLessThan(mockSend.mock.invocationCallOrder[0]);
});

test('seller messages notify the buyer', async () => {
  await send({ senderId: 'seller' }, Object.assign(new UserModel(), user, { firebaseUid: 'seller' }));
  expect(mockFindUser).toHaveBeenCalledWith(UserModel, { firebaseUid: 'buyer' });
});

test('first messages create the chat and notify the other participant', async () => {
  mockDoc.get.mockResolvedValue({ exists: false, data: () => undefined });
  await send();
  expect(mockDoc.set).toHaveBeenCalledWith(expect.objectContaining({ userIDs: ['buyer', 'seller'] }));
  expect(mockSend).toHaveBeenCalledTimes(1);
});

test('photo-only messages get a readable preview and text previews are bounded', async () => {
  await send({ text: '', images: ['https://example.com/photo.jpg'] });
  expect(mockSend).toHaveBeenLastCalledWith(expect.objectContaining({ body: 'Sent a photo' }));
  await send({ text: 'a'.repeat(500) });
  expect(mockSend).toHaveBeenLastCalledWith(expect.objectContaining({ body: 'a'.repeat(200) }));
});

test('does not attempt a push before the message write completes', async () => {
  let finishSave!: () => void;
  mockAdd.mockImplementation(() => new Promise<void>(resolve => { finishSave = resolve; }));
  const pending = send();
  await new Promise(resolve => setImmediate(resolve));
  expect(mockSend).not.toHaveBeenCalled();
  finishSave();
  await pending;
  expect(mockSend).toHaveBeenCalledTimes(1);
});

test('a failed Firestore save fails the request and sends no notification', async () => {
  mockAdd.mockRejectedValue(new Error('Firestore unavailable'));
  await expect(send()).rejects.toThrow('Firestore unavailable');
  expect(mockSend).not.toHaveBeenCalled();
});

test('a thrown notification failure does not fail the saved message', async () => {
  mockSend.mockRejectedValue(new Error('FCM unavailable'));
  await expect(send()).resolves.toMatchObject({ text: body.text });
  expect(console.error).toHaveBeenCalled();
});

test.each([
  { sentCount: 0, failedCount: 0, persistenceFailedCount: 0 },
  { sentCount: 0, failedCount: 1, persistenceFailedCount: 0 },
  { sentCount: 1, failedCount: 1, persistenceFailedCount: 0 },
  { sentCount: 1, failedCount: 0, persistenceFailedCount: 1 },
])('logs incomplete delivery without failing the message: %j', async result => {
  mockSend.mockResolvedValue(result);
  await expect(send()).resolves.toMatchObject({ text: body.text });
  expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('incomplete'), result);
});

test('a missing recipient does not fail the saved message', async () => {
  mockFindUser.mockResolvedValue(undefined);
  await expect(send()).resolves.toMatchObject({ text: body.text });
  expect(mockSend).not.toHaveBeenCalled();
  expect(console.warn).toHaveBeenCalled();
});

test('rejects spoofed senders and nonparticipants before writing or notifying', async () => {
  await expect(send({ senderId: 'seller' })).rejects.toThrow('senderId must match');
  await expect(send({ senderId: 'outsider' }, Object.assign(new UserModel(), user, { firebaseUid: 'outsider' }))).rejects.toThrow('not part');
  expect(mockAdd).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

test('rejects invalid new-chat participants before writing or notifying', async () => {
  mockDoc.get.mockResolvedValue({ exists: false, data: () => undefined });
  await expect(send({ sellerId: 'buyer' })).rejects.toThrow('distinct buyer and seller');
  await expect(send({ sellerId: '' })).rejects.toThrow('distinct buyer and seller');
  await expect(send({ buyerId: 'outsider' })).rejects.toThrow('not part');
  expect(mockDoc.set).not.toHaveBeenCalled();
  expect(mockSend).not.toHaveBeenCalled();
});

const otherChatWrites = [
  () => controller.postAvailability(user, { id: 'chat' }, { ...body, availabilities: [] }),
  () => controller.sendProposal(user, { id: 'chat' }, { ...body, startDate: new Date(), endDate: new Date() } as any),
  () => controller.respondProposal(user, { id: 'chat' }, { ...body, accepted: false, startDate: new Date(), endDate: new Date() } as any),
  () => controller.cancelProposal(user, { id: 'chat' }, { ...body, startDate: new Date(), endDate: new Date() } as any),
];

test.each(otherChatWrites.map((write, index) => ({ write, index })))('chat write $index waits for Firestore and propagates save failure', async ({ write }) => {
  let rejectSave!: (error: Error) => void;
  mockAdd.mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectSave = reject; }));
  const settled = jest.fn();
  const pending = write();
  void pending.then(settled, settled);
  await new Promise(resolve => setImmediate(resolve));
  expect(settled).not.toHaveBeenCalled();
  rejectSave(new Error('Firestore unavailable'));
  await expect(pending).rejects.toThrow('Firestore unavailable');
  expect(mockSend).not.toHaveBeenCalled();
});


test.each([false, true])('accepted proposal notifies only after successful chat persistence (save fails: %s)', async saveFails => {
  mockFindUser
    .mockResolvedValueOnce({ firebaseUid: 'buyer', email: 'buyer@example.com' })
    .mockResolvedValueOnce({ firebaseUid: 'seller', username: 'Seller' })
    .mockResolvedValueOnce({ id: 'listing', title: 'Listing', originalPrice: 10, images: [] });
  mockQueryRunner.query.mockResolvedValue([{ id: 'transaction' }]);
  if (saveFails) mockAdd.mockRejectedValueOnce(new Error('Save failed'));
  const pending = controller.respondProposal(user, { id: 'chat' }, {
    ...body, accepted: true, startDate: new Date(), endDate: new Date(),
  } as any);
  if (saveFails) {
    await expect(pending).rejects.toThrow('Save failed');
    expect(mockSend).not.toHaveBeenCalled();
  } else {
    await expect(pending).resolves.toMatchObject({ transactionId: 'transaction' });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockDoc.update.mock.invocationCallOrder[0]).toBeLessThan(mockSend.mock.invocationCallOrder[0]);
    expect(mockQueryRunner.commitTransaction.mock.invocationCallOrder[0]).toBeLessThan(mockSend.mock.invocationCallOrder[0]);
  }
});
