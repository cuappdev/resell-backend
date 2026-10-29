import "reflect-metadata";
import { Request, Response } from "express";
import { localAuthOnly } from "../api/middlewares/LocalAuthOnly";

describe("local authentication boundary", () => {
  const originalEnv = process.env;
  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: "development", ENABLE_LOCAL_AUTH: "true" };
    delete process.env.VERCEL;
    delete process.env.IS_PROD;
  });
  afterEach(() => { process.env = originalEnv; });

  function invoke(address = "127.0.0.1", headers = {}) {
    const next = jest.fn();
    localAuthOnly({ socket: { remoteAddress: address, localPort: 3000 }, headers } as Request, {} as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
  }

  test.each(["127.0.0.1", "::1", "::ffff:127.0.0.1"])("allows direct loopback %s", address => {
    invoke(address);
  });
  test.each([
    ["ENABLE_LOCAL_AUTH", "false"],
    ["NODE_ENV", "production"],
    ["NODE_ENV", ""],
    ["IS_PROD", "true"],
    ["VERCEL", "1"],
  ])("blocks when %s=%s", (key, value) => {
    process.env[key] = value;
    expect(() => invoke()).toThrow();
  });
  test("blocks remote callers even with a spoofed forwarding header", () => {
    expect(() => invoke("192.0.2.1", { "x-forwarded-for": "127.0.0.1" })).toThrow();
  });
  test.each(["origin", "forwarded", "x-forwarded-for"])("blocks requests containing %s", header => {
    expect(() => invoke("127.0.0.1", { [header]: "external" })).toThrow();
  });
  test("allows same-origin local Swagger", () => {
    invoke("127.0.0.1", { origin: "http://localhost:3000", host: "localhost:3000" });
  });
  test.each([
    { origin: "http://localhost:4000", host: "localhost:3000" },
    { origin: "http://evil.example:3000", host: "evil.example:3000" },
    { origin: "null", host: "localhost:3000" },
    { origin: "http://localhost:3000", host: "127.0.0.1:3000" },
  ])("blocks other browser origins: %j", headers => {
    expect(() => invoke("127.0.0.1", headers)).toThrow();
  });
});
