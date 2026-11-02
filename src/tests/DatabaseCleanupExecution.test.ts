import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { Connection } from "typeorm";
import {
  executeCleanup,
  reserveReport,
} from "../../scripts/database-cleanup/execution";
import {
  snapshot,
  assertPostconditions,
} from "../../scripts/database-cleanup/verification";

jest.mock("../../scripts/database-cleanup/verification", () => ({
  snapshot: jest.fn(),
  assertPostconditions: jest.fn(),
  assertPreserved: jest.fn(),
}));
jest.mock("typeorm/migration/MigrationExecutor", () => ({
  MigrationExecutor: jest.fn(() => ({ executeMigration: jest.fn() })),
}));

const directory = mkdtempSync(join(tmpdir(), "resell-cleanup-execution-"));
const identity = {
  branch: { id: "fixture", name: "fixture", project_id: "fixture" },
  host: "fixture.invalid",
  database: "neondb",
};
// Match the existing executable inventory as an already-applied synthetic ledger.
// Reading source text never imports historical migrations or opens a database.
const migrations = resolve(__dirname, "../migrations");
const history = readdirSync(migrations)
  .filter((name) => name.endsWith(".ts"))
  .map((file, id) => {
    const source = readFileSync(join(migrations, file), "utf8");
    const match =
      source.match(/\bname\s*=\s*["']([^"']+)/) ||
      source.match(/export class\s+(\w+)/);
    if (!match) throw new Error(`Missing fixture migration name: ${file}`);
    return { id, timestamp: "0", name: match[1] };
  });

function fixture() {
  const runner = {
    isTransactionActive: true,
    startTransaction: jest.fn().mockResolvedValue(undefined),
    query: jest.fn(async (sql: string) => {
      if (sql.includes("pg_try_advisory")) return [{ acquired: true }];
      if (sql.includes("current_database")) return [{ database: "neondb" }];
      if (sql.includes("to_regclass")) return [{ present: true }];
      if (sql.includes("SELECT id,timestamp,name")) return history;
      return [];
    }),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
  };
  runner.commitTransaction.mockImplementation(async () => {
    runner.isTransactionActive = false;
  });
  runner.rollbackTransaction.mockImplementation(async () => {
    runner.isTransactionActive = false;
  });
  const connection = {
    createQueryRunner: () => runner,
    close: jest.fn().mockResolvedValue(undefined),
  };
  const reportPath = join(directory, `${Date.now()}-${Math.random()}.json`);
  const persist = reserveReport(reportPath, identity);
  return {
    runner,
    connection: connection as unknown as Connection,
    reportPath,
    persist,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  (snapshot as jest.Mock).mockResolvedValue({
    tables: {},
    dates: [],
    protectedSchema: {},
  });
  (assertPostconditions as jest.Mock).mockResolvedValue(undefined);
});
afterAll(() => rmSync(directory, { recursive: true, force: true }));

test("report reservation never overwrites evidence and atomic persistence retains private permissions", () => {
  const path = join(directory, "reserved.json");
  const persist = reserveReport(path, identity);
  const original = readFileSync(path, "utf8");
  expect(statSync(path).mode & 0o777).toBe(0o600);
  expect(() => reserveReport(path, identity)).toThrow();
  expect(readFileSync(path, "utf8")).toBe(original);
  persist("verified-pending-commit", { verified: true });
  expect(JSON.parse(readFileSync(path, "utf8"))).toEqual({
    verified: true,
    state: "verified-pending-commit",
  });
  expect(statSync(path).mode & 0o777).toBe(0o600);
});

test("lost COMMIT response remains outcome-unknown even when rollback succeeds", async () => {
  const f = fixture();
  f.runner.commitTransaction.mockImplementation(async () => {
    expect(JSON.parse(readFileSync(f.reportPath, "utf8"))).toMatchObject({
      state: "verified-pending-commit",
      verified: true,
    });
    throw new Error("connection lost");
  });
  await expect(
    executeCleanup(f.connection, identity, true, f.reportPath, f.persist),
  ).rejects.toThrow("outcome-unknown:");
  expect(f.runner.rollbackTransaction).toHaveBeenCalledTimes(1);
  expect(JSON.parse(readFileSync(f.reportPath, "utf8"))).toMatchObject({
    state: "outcome-unknown",
    verified: true,
  });
  expect(f.runner.release).toHaveBeenCalledTimes(1);
  expect(f.connection.close).toHaveBeenCalledTimes(1);
});

test("verification failure rolls back without attempting COMMIT", async () => {
  const f = fixture();
  (assertPostconditions as jest.Mock).mockRejectedValueOnce(
    new Error("unexpected schema"),
  );
  await expect(
    executeCleanup(f.connection, identity, true, f.reportPath, f.persist),
  ).rejects.toThrow("rolled-back:");
  expect(f.runner.commitTransaction).not.toHaveBeenCalled();
  expect(f.runner.rollbackTransaction).toHaveBeenCalledTimes(1);
  expect(JSON.parse(readFileSync(f.reportPath, "utf8"))).toMatchObject({
    state: "rolled-back",
    error: "unexpected schema",
  });
});

test("failure saving the final report after COMMIT is reported as committed", async () => {
  const f = fixture();
  const states: string[] = [];
  const persist = (state: string, body: Record<string, unknown>) => {
    states.push(state);
    if (states.length === 2) throw new Error("report disk failure");
    f.persist(state, body);
  };
  await expect(
    executeCleanup(f.connection, identity, true, f.reportPath, persist),
  ).rejects.toThrow("committed:");
  expect(states).toEqual(["verified-pending-commit", "committed", "committed"]);
  expect(f.runner.rollbackTransaction).not.toHaveBeenCalled();
  expect(JSON.parse(readFileSync(f.reportPath, "utf8"))).toMatchObject({
    state: "committed",
    error: "report disk failure",
  });
});
