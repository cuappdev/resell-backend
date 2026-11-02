import "reflect-metadata";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join, resolve } from "path";
import { createConnection } from "typeorm";
import { Branch, projectId, assertTarget } from "./database-cleanup/guards";
import { reserveReport, executeCleanup } from "./database-cleanup/execution";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const flag = (name: string): boolean => args.includes(name);
  const option = (name: string): string | undefined => {
    const index = args.indexOf(name);
    return index < 0 ? undefined : args[index + 1];
  };
  for (let index = 0; index < args.length; index++) {
    const name = args[index];
    if (["--branch-id", "--report"].includes(name)) {
      if (!args[index + 1] || args[index + 1].startsWith("--")) {
        throw new Error(`Missing value for ${name}`);
      }
      index++;
    } else if (!["--apply", "--writes-paused"].includes(name)) {
      throw new Error(`Unknown option: ${name}`);
    }
  }
  const branchId = option("--branch-id");
  if (!flag("--branch-id") || !branchId || branchId.startsWith("--")) {
    throw new Error(
      "Specify --branch-id explicitly; inventory is the default.",
    );
  }
  const token =
    process.env.NEON_API_KEY ||
    JSON.parse(
      readFileSync(join(homedir(), ".config/neon/credentials.json"), "utf8"),
    ).access_token;
  async function neon<T>(path: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(
        `https://console.neon.tech/api/v2/projects/${projectId}${path}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        },
      );
      if (!response.ok)
        throw new Error(`Neon metadata lookup failed: HTTP ${response.status}`);
      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }
  const { branch } = await neon<{ branch: Branch }>(
    `/branches/${encodeURIComponent(branchId)}`,
  );
  if (branch.id !== branchId)
    throw new Error("Neon returned a different branch identity.");
  const { endpoints } = await neon<{
    endpoints: Array<{ host: string; type: string; branch_id: string }>;
  }>(`/branches/${encodeURIComponent(branchId)}/endpoints`);
  const direct = endpoints.filter(
    (endpoint) =>
      endpoint.type === "read_write" && endpoint.branch_id === branchId,
  );
  if (direct.length !== 1)
    throw new Error("Expected exactly one existing read/write endpoint.");
  const { uri } = await neon<{ uri: string }>(
    `/connection_uri?${new URLSearchParams({
      branch_id: branchId,
      database_name: "neondb",
      role_name: "neondb_owner",
      pooled: "false",
    })}`,
  );
  assertTarget(branch, direct[0].host, uri);
  if (
    flag("--apply") &&
    branch.name === "production" &&
    !flag("--writes-paused")
  ) {
    throw new Error(
      "Production apply requires an established write pause and --writes-paused.",
    );
  }
  const reportPath = resolve(
    option("--report") ||
      join(
        __dirname,
        "../secrets/cleanup-reports",
        `${branch.name}-${Date.now()}.json`,
      ),
  );
  const branchIdentity = {
    id: branch.id,
    name: branch.name,
    project_id: branch.project_id,
    parent_id: branch.parent_id,
  };
  const identityReport = {
    branch: branchIdentity,
    host: direct[0].host,
    database: "neondb",
  };
  const persist = reserveReport(reportPath, identityReport);
  const url = new URL(uri);
  url.searchParams.set("sslmode", "verify-full");
  const connection = await createConnection({
    name: `guarded-cleanup-${Date.now()}`,
    type: "postgres",
    url: url.toString(),
    schema: "public",
    entities: [],
    synchronize: false,
    migrationsRun: false,
    logging: false,
    extra: { max: 1, connectionTimeoutMillis: 12000 },
  });
  const report = await executeCleanup(
    connection,
    identityReport,
    flag("--apply"),
    reportPath,
    persist,
  );
  console.log(
    JSON.stringify({
      branch: branch.name,
      branchId,
      apply: flag("--apply"),
      report: reportPath,
      pendingOrApplied: report.pending || report.applied,
      verified: report.verified || false,
    }),
  );
}

if (require.main === module) {
  main().catch((error: Error) => {
    console.error(
      error.message.replace(
        /postgres(?:ql)?:\/\/\S+/g,
        "[redacted connection]",
      ),
    );
    process.exitCode = 1;
  });
}
