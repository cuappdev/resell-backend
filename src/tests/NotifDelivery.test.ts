/// <reference types="jest" />

import "reflect-metadata";
import { EntityManager } from "typeorm";
import Repositories from "../repositories";
import { NotifService } from "../services/NotifService";

jest.mock("../firebase", () => ({
  firebaseAdmin: { messaging: () => ({ send: mockSend }) },
}));
jest.mock("../repositories", () => ({
  __esModule: true,
  default: {
    user: jest.fn(),
    fcmToken: jest.fn(),
    notification: jest.fn(),
  },
  TransactionsManager: class {
    readWrite(fn: (manager: unknown) => unknown) { return fn({}); }
  },
}));

const mockSend = jest.fn();
const save = jest.fn();
const getTokensByUserId = jest.fn();
const request = { email: "recipient@example.com", title: "Test", body: "Hello", data: {} as JSON };
let service: NotifService;

beforeEach(() => {
  jest.clearAllMocks();
  mockSend.mockReset().mockResolvedValue("fcm-message-id");
  save.mockReset().mockResolvedValue({});
  getTokensByUserId.mockResolvedValue([{ token: "first" }, { token: "second" }]);
  (Repositories.user as jest.Mock).mockReturnValue({ getUserByEmail: jest.fn().mockResolvedValue({ firebaseUid: "recipient" }) });
  (Repositories.fcmToken as jest.Mock).mockReturnValue({ getTokensByUserId });
  (Repositories.notification as jest.Mock).mockReturnValue({ save });
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  service = new NotifService({} as EntityManager);
});

afterEach(() => jest.restoreAllMocks());

test.each([false, true])("returns a failure result on unexpected errors (prior send: %s)", async priorSend => {
  const error = new Error("Unexpected notification processing failure");
  // Inject a failure at the delivery boundary, including after a push was accepted.
  jest.spyOn(service as any, "sendToUser").mockImplementationOnce(async () => {
    if (priorSend) await mockSend();
    throw error;
  });
  const continueCaller = jest.fn();
  const result = await service.sendNotifs(request);
  continueCaller(result);

  expect(continueCaller).toHaveBeenCalledWith({
    message: "Notification processing failed; delivery outcome unknown",
    httpCode: 500,
  });
  expect(result).not.toHaveProperty("sentCount");
  expect(result).not.toHaveProperty("failedCount");
  expect(result).not.toHaveProperty("persistenceFailedCount");
  expect(console.error).toHaveBeenCalledWith("Failed to send notification:", error);
});

test("reports failure when every FCM send fails", async () => {
  mockSend.mockRejectedValue(new Error("FCM unavailable"));
  expect(await service.sendNotifs(request)).toEqual({
    message: "Notification not sent", httpCode: 500,
    sentCount: 0, failedCount: 2, persistenceFailedCount: 0,
  });
  expect(mockSend).toHaveBeenCalledTimes(2);
  expect(save).not.toHaveBeenCalled();
  expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("FCM unavailable"));
});

test("continues after a failed token and reports partial success", async () => {
  mockSend.mockRejectedValueOnce(new Error("Invalid token"));
  expect(await service.sendNotifs(request)).toEqual({
    message: "Notification partially sent", httpCode: 207,
    sentCount: 1, failedCount: 1, persistenceFailedCount: 0,
  });
  expect(mockSend).toHaveBeenLastCalledWith(expect.objectContaining({ token: "second" }));
  expect(save).toHaveBeenCalledTimes(1);
});

test("reports success when all tokens are accepted by FCM", async () => {
  expect(await service.sendNotifs(request)).toEqual({
    message: "Notification sent successfully", httpCode: 200,
    sentCount: 2, failedCount: 0, persistenceFailedCount: 0,
  });
  expect(save).toHaveBeenCalledTimes(2);
});

test("reports no tokens without attempting delivery", async () => {
  getTokensByUserId.mockResolvedValue([]);
  expect(await service.sendNotifs(request)).toEqual({
    message: "No device tokens found", httpCode: 200,
    sentCount: 0, failedCount: 0, persistenceFailedCount: 0,
  });
  expect(mockSend).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
});

test("does not misreport an accepted push as a send failure when persistence fails", async () => {
  save.mockRejectedValueOnce(new Error("Database unavailable"));
  expect(await service.sendNotifs(request)).toEqual({
    message: "Notification sending completed with persistence failures", httpCode: 500,
    sentCount: 2, failedCount: 0, persistenceFailedCount: 1,
  });
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Failed to persist"));
});

test('converts numeric and null payload data into FCM strings', async () => {
  await service.sendNotifs({ ...request, data: { price: 10, imageUrl: null, postId: 'post' } as unknown as JSON });
  expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ data: { price: '10', imageUrl: '', postId: 'post' } }));
});

test('best-effort delivery logs incomplete results without throwing', async () => {
  mockSend.mockRejectedValue(new Error('FCM unavailable'));
  await expect(service.sendNotifsSafely(request)).resolves.toBeUndefined();
  expect(console.warn).toHaveBeenCalledWith('Notification delivery incomplete:', expect.objectContaining({ sentCount: 0, failedCount: 2 }));
});
