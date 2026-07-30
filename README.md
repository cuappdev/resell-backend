# Resell Backend

An open-sourced backend service for Resell.

## Stack

- **Runtime:** Node 20, Express (`routing-controllers` + TypeORM 0.2)
- **Database:** [Neon](https://neon.tech) PostgreSQL **18** (pooled URL for the app, direct URL for migrations)
- **Hosting:** [Vercel](https://vercel.com) (Fluid Express). Docker Swarm / DigitalOcean are retired.

Semantic similarity (similar posts, request matching, search vectors) uses **OpenAI embeddings** (`text-embedding-3-small`) stored as `float[]`, with **exact cosine KNN in TypeScript**. Set `OPENAI_API_KEY` in your `.env`. Without it, embeddings stay null and those features degrade gracefully. No `pgvector` extension is required.

## Setup

1. Install Node 20 (`nvm install 20 && nvm use 20`).
2. From the repo root: `npm install`
3. Configure Neon for your editor (once per machine):

   ```bash
   npx neon@latest init
   ```

   Select **Cursor**, **VS Code**, and **Claude CLI** (Space to toggle). For **Zed**:

   ```bash
   npx add-mcp https://mcp.neon.tech/mcp -a zed -g
   ```

4. Link env vars to the Neon project (writes `DATABASE_URL` / `DATABASE_URL_UNPOOLED` into `.env`):

   ```bash
   npx neon@latest env pull
   ```

   Or copy [`.env_template`](.env_template) to `.env` and fill values manually.

5. Firebase: set either `FIREBASE_SERVICE_ACCOUNT_JSON` (stringified JSON, preferred for Vercel) or `FIREBASE_SERVICE_ACCOUNT_PATH` (local file path).

6. Apply schema:

   ```bash
   npm run db:migrate
   ```

7. Run locally:

   ```bash
   npm run dev
   ```

   Health check: `GET http://localhost:3000/health`

Neon branches used by this project:

| Neon branch | Use |
|-------------|-----|
| `production` | Vercel Production |
| `staging` | Vercel Preview / `main` deploys |
| `dev` | Local development (optional personal branches later) |

Project context is stored in [`.neon`](.neon) (safe to commit; no secrets).

## Migrations

```bash
npm run db:migrate
```

CI runs migrations via [`.github/workflows/migrate-neon.yml`](.github/workflows/migrate-neon.yml) using GitHub secrets:

- `DATABASE_URL_UNPOOLED_PRODUCTION`
- `DATABASE_URL_UNPOOLED_STAGING`
- `DATABASE_URL_UNPOOLED_DEV`

Push to `release` migrates **production**; push to `main` migrates **staging**. App deploy is handled by Vercel Git integration (not Docker).

## Vercel

1. Import the GitHub repo in Vercel.
2. Set env vars for Production / Preview to match Neon branch URLs, plus Firebase JSON, `OPENAI_API_KEY`, upload settings, `IS_PROD`, and `CRON_SECRET`.
3. Entry is [`src/app.ts`](src/app.ts) (default export for Fluid Express; `app.listen` only when not on Vercel).
4. Cron: [`vercel.json`](vercel.json) hits `GET /api/cron/transaction-confirmations` with `Authorization: Bearer ${CRON_SECRET}`. The transaction confirmation job body is still disabled until product re-enables it.

## Seeding (optional)

```bash
npm run db:seed
```

Seeding is skipped when `IS_PROD=true`.

## Deprecated

- Local Homebrew / Docker Postgres install (use Neon `dev` instead)
- DigitalOcean dump/import scripts (one-time migration only if needed)
- [`Dockerfile`](Dockerfile) / [`docker-compose.yml`](docker-compose.yml) and the disabled Swarm workflows under `.github/workflows/deploy-*.yml`
