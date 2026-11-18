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

## Backfill post embeddings

Set `DATABASE_URL` and `OPENAI_API_KEY` in `.env`. The command targets that
database (shell variables take precedence), prints its host/name without credentials,
and includes archived and sold posts that have no embedding.

```bash
npm run embeddings:backfill -- --dry-run
npm run embeddings:backfill -- --limit 5
npm run embeddings:backfill
```

The dry run only counts missing embeddings; it makes no OpenAI requests or writes.
The backfill sends each post's title and description to the existing OpenAI embedding
service and saves its 512-dimensional vector in `Post.embedding`. It reads 25 posts
at a time, processes requests sequentially, and retries failed generation up to three
times. Successful writes are saved immediately, so rerunning skips completed posts.
Failed posts remain missing and produce a nonzero exit status. Concurrently changed
posts are skipped to avoid saving stale embeddings. Similar-item caches for updated
posts are cleared and populated lazily by similar-item requests. Existing populated
embeddings are never overwritten. API usage is billed to the configured key.

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

### Proposal acceptance retries

`POST /api/chat/proposal/:id` treats accepted proposals with the same chat, buyer,
seller, listing, and meeting start/end instants as one operation. No new request
fields are required. Equivalent timezone representations produce the same ID.
The first acceptance creates a deterministic UUID transaction; retries preserve
its ID, timestamp, amount, and completion state. A changed meeting interval is a
separate acceptance. Intentionally separate proposals with identical details are
also treated as one acceptance because the current API has no proposal ID.

A deterministic Firestore message is created atomically with the chat timestamp.
If Postgres commits and Firestore fails, retrying repairs the missing message
without inserting another transaction. Repeated successful requests do not create
another message or resend the confirmation push. Push delivery remains best effort:
a crash or lost acknowledgement after the Firestore commit can still lose the push.
This does not make Postgres and Firestore one atomic transaction.

No database migration is needed: uniqueness uses the existing transaction primary
key. This applies to acceptances created by the new implementation; it does not
reconcile historical transactions/messages created with random IDs. Acceptance
requires a matching authenticated sender and a valid, increasing meeting interval.

The focused tests include an optional real-Postgres concurrency suite (Firestore
and FCM are mocked). Run it only against a dedicated temporary local cluster:

```sh
proposal_pg_dir=$(mktemp -d /tmp/resell-idempotency.XXXXXX)
initdb -D "$proposal_pg_dir/data" -A trust --no-locale
pg_ctl -D "$proposal_pg_dir/data" -l "$proposal_pg_dir/server.log" \
  -o "-h '' -k $proposal_pg_dir -p 55439" -w start
PROPOSAL_TEST_PG_SOCKET="$proposal_pg_dir" npx jest src/tests/ProposalIdempotency.test.ts --runInBand
pg_ctl -D "$proposal_pg_dir/data" -m fast -w stop
```

The integration suite creates and drops a synthetic `Transaction` table in that
isolated cluster. Without `PROPOSAL_TEST_PG_SOCKET`, those integration cases are
skipped; the deterministic-ID unit test still runs.
