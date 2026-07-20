import { Connection, ConnectionOptions, createConnection } from "typeorm";

import { models } from "../models";

function usesSsl(connectionUrl?: string): boolean {
  if (connectionUrl) {
    return (
      connectionUrl.includes("sslmode=") ||
      connectionUrl.includes("neon.tech") ||
      process.env.IS_PROD?.toLowerCase() === "true"
    );
  }
  return process.env.IS_PROD?.toLowerCase() === "true";
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
  const ssl = usesSsl(url);

  const base: ConnectionOptions = url
    ? {
        type: "postgres",
        url,
        entities: models,
        synchronize: false,
        logging: process.env.DB_LOGGING?.toLowerCase() === "true",
        extra: {
          max: Number(process.env.DB_POOL_MAX || 5),
          ssl: ssl ? { rejectUnauthorized: true } : undefined,
        },
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
        extra: {
          max: Number(process.env.DB_POOL_MAX || 5),
          ssl: ssl ? { rejectUnauthorized: true } : undefined,
        },
        migrations: ["src/migrations/*.ts"],
        cli: {
          entitiesDir: "src/models/",
          migrationsDir: "src/migrations",
        },
      };

  return { ...base, ...overrides } as ConnectionOptions;
}

export default async function resellConnection(): Promise<Connection> {
  return await createConnection(
    buildConnectionOptions({
      logging: true,
    }),
  );
}
