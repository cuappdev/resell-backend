import {
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  openSync,
  closeSync,
  fsyncSync,
  renameSync,
} from "fs";
import { dirname, join, resolve } from "path";
import { Connection } from "typeorm";
import { Migration } from "typeorm/migration/Migration";
import { MigrationExecutor } from "typeorm/migration/MigrationExecutor";
import { AlignActiveDatabaseIntegrity1793574441324 } from "../../src/migrations/1793574441324-AlignActiveDatabaseIntegrity";
import { MarkKnownLegacySaveDatesUnknown1793574441325 } from "../../src/migrations/1793574441325-MarkKnownLegacySaveDatesUnknown";
import { Branch, beginCleanupTransaction, pendingCleanup } from "./guards";
import {
  snapshot,
  assertPreserved,
  assertPostconditions,
} from "./verification";

const cleanup = [
  new AlignActiveDatabaseIntegrity1793574441324(),
  new MarkKnownLegacySaveDatesUnknown1793574441325(),
];
export type IdentityReport = {
  branch: Branch;
  host: string;
  database: string;
};
type Persist = (state: string, body: Record<string, unknown>) => void;

export function reserveReport(
  reportPath: string,
  identityReport: IdentityReport,
): Persist {
  mkdirSync(dirname(reportPath), { recursive: true, mode: 0o700 });
  // Reserve the report before connecting; never overwrite an earlier run.
  writeFileSync(
    reportPath,
    JSON.stringify({ ...identityReport, state: "initializing" }, null, 2),
    { flag: "wx", mode: 0o600 },
  );
  return (state: string, body: Record<string, unknown>): void => {
    const temporary = `${reportPath}.${process.pid}.tmp`;
    writeFileSync(temporary, JSON.stringify({ ...body, state }, null, 2), {
      flag: "wx",
      mode: 0o600,
    });
    const descriptor = openSync(temporary, "r");
    try {
      fsyncSync(descriptor);
    } finally {
      closeSync(descriptor);
    }
    renameSync(temporary, reportPath);
  };
}

export async function executeCleanup(
  connection: Connection,
  identityReport: IdentityReport,
  apply: boolean,
  reportPath: string,
  persist: Persist,
): Promise<Record<string, unknown>> {
  const branchIdentity = identityReport.branch;
  const host = identityReport.host;
  const runner = connection.createQueryRunner();
  let report: Record<string, unknown> = identityReport;
  let commitAttempted = false;
  let commitConfirmed = false;
  let failure: Error | undefined;
  try {
    await beginCleanupTransaction(runner, apply);
    const [identity] = await runner.query(
      "SELECT current_database() AS database",
    );
    const [ledger] = await runner.query(
      "SELECT to_regclass('public.migrations') IS NOT NULL AS present",
    );
    if (identity.database !== "neondb" || !ledger.present)
      throw new Error("Unexpected database or missing migration ledger.");
    const history: Array<{ id: number; timestamp: string; name: string }> =
      await runner.query(
        "SELECT id,timestamp,name FROM public.migrations ORDER BY id",
      );
    const directory = resolve(__dirname, "../../src/migrations");
    const files = readdirSync(directory).filter((file) => file.endsWith(".ts"));
    if (files.some((file) => file.includes("SyncProdSchema")))
      throw new Error(
        "Retire the unsafe legacy SyncProdSchema from the executable inventory first.",
      );
    const sourceNames = files.map((file) => {
      const source = readFileSync(join(directory, file), "utf8");
      const name =
        source.match(/\bname\s*=\s*["']([^"']+)/) ||
        source.match(/export class\s+(\w+)/);
      if (!name) throw new Error(`Cannot identify migration ${file}`);
      return name[1];
    });
    const pending = pendingCleanup(
      history.map((row) => row.name),
      sourceNames,
    );
    const before = await snapshot(runner);
    if (apply) {
      const executor = new MigrationExecutor(connection, runner);
      for (const migration of cleanup.filter((item) =>
        pending.includes(item.name),
      )) {
        await executor.executeMigration(
          new Migration(
            undefined,
            Number(migration.name.slice(-13)),
            migration.name,
            migration,
          ),
        );
      }
      await assertPostconditions(runner);
      const after = await snapshot(runner);
      assertPreserved(before, after);
      const applied: Array<{ id: number; timestamp: string; name: string }> =
        await runner.query(
          "SELECT id,timestamp,name FROM public.migrations ORDER BY id",
        );
      if (
        pendingCleanup(
          applied.map((row) => row.name),
          sourceNames,
        ).length
      )
        throw new Error("Cleanup migration ledger verification failed.");
      const originalHistory = applied.filter(
        (row) => !cleanup.some((migration) => migration.name === row.name),
      );
      const expectedHistory = history.filter(
        (row) => !cleanup.some((migration) => migration.name === row.name),
      );
      if (JSON.stringify(originalHistory) !== JSON.stringify(expectedHistory))
        throw new Error("Historical migration records changed; rolling back.");
      report = {
        branch: branchIdentity,
        host,
        database: "neondb",
        applied: pending,
        historyBefore: history,
        historyAfter: applied,
        before,
        after,
        verified: true,
      };
    } else {
      report = {
        branch: branchIdentity,
        host,
        database: "neondb",
        pending,
        history,
        snapshot: before,
        readOnly: true,
      };
    }
    persist("verified-pending-commit", report);
    commitAttempted = true;
    await runner.commitTransaction();
    commitConfirmed = true;
    persist("committed", report);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    let outcome = commitConfirmed
      ? "committed"
      : commitAttempted
        ? "outcome-unknown"
        : "not-committed";
    if (!commitConfirmed && runner.isTransactionActive) {
      try {
        await runner.rollbackTransaction();
        if (!commitAttempted) outcome = "rolled-back";
      } catch {
        outcome = "outcome-unknown";
      }
    }
    try {
      persist(outcome, { ...report, error: message });
    } catch {
      /* Retain prior evidence. */
    }
    failure = new Error(
      `${outcome}: ${message}. Inspect report ${reportPath} and the ledger read-only before retrying.`,
    );
  } finally {
    for (const close of [() => runner.release(), () => connection.close()]) {
      try {
        await close();
      } catch (error) {
        if (!failure)
          failure = new Error(
            `${commitConfirmed ? "committed" : "outcome-unknown"}: connection cleanup failed; inspect ${reportPath} before retrying.`,
          );
      }
    }
  }
  if (failure) throw failure;
  return report;
}
