import { Connection, ConnectionOptions, createConnection, getConnectionManager } from "typeorm";

import { models } from "../models";

/** Prefer URL sslmode; only add pg ssl when needed and not already in the URL. */
function pgExtra(connectionUrl?: string): Record<string, unknown> {
  const extra: Record<string, unknown> = {
    max: Number(process.env.DB_POOL_MAX || 5),
  };

  if (!connectionUrl) {
    if (process.env.IS_PROD?.toLowerCase() === "true") {
      extra.ssl = { rejectUnauthorized: false };
    }
    return extra;
  }

  // Neon pooled/direct URLs already include sslmode=require — don't double-configure SSL.
  if (connectionUrl.includes("sslmode=")) {
    return extra;
  }

  if (
    connectionUrl.includes("neon.tech") ||
    process.env.IS_PROD?.toLowerCase() === "true"
  ) {
    extra.ssl = { rejectUnauthorized: false };
  }

  return extra;
}

/** Runtime app connection (prefer pooled Neon URL). */
export function getRuntimeDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || undefined;
}

/** Migrations / CLI (prefer direct Neon URL). */
export function getMigrationDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL ||
    undefined
  );
}

export function buildConnectionOptions(
  overrides: Partial<ConnectionOptions> = {},
): ConnectionOptions {
  const url =
    (overrides as { url?: string }).url ?? getRuntimeDatabaseUrl();

  const base: ConnectionOptions = url
    ? {
        type: "postgres",
        url,
        entities: models,
        synchronize: false,
        logging: process.env.DB_LOGGING?.toLowerCase() === "true",
        extra: pgExtra(url),
        migrations: ["src/migrations/*.ts"],
        cli: {
          entitiesDir: "src/models/",
          migrationsDir: "src/migrations",
        },
      }
    : {
        type: "postgres",
        host: process.env.DB_HOST,
        port: +(process.env.DB_PORT || 5432),
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "resell-test",
        entities: models,
        synchronize: false,
        logging: process.env.DB_LOGGING?.toLowerCase() === "true",
        extra: pgExtra(undefined),
        migrations: ["src/migrations/*.ts"],
        cli: {
          entitiesDir: "src/models/",
          migrationsDir: "src/migrations",
        },
      };

  return { ...base, ...overrides } as ConnectionOptions;
}

export default async function resellConnection(): Promise<Connection> {
  const manager = getConnectionManager();
  if (manager.has("default")) {
    const existing = manager.get("default");
    if (existing.isConnected) {
      return existing;
    }
    return existing.connect();
  }

  return await createConnection(
    buildConnectionOptions({
      logging: true,
    }),
  );
}
