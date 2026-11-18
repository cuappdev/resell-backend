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

5. For authenticated local testing, follow [Local testing with Firebase emulators](#local-testing-with-firebase-emulators). For deployments, configure `FIREBASE_SERVICE_ACCOUNT_JSON` (preferred on Vercel) or `FIREBASE_SERVICE_ACCOUNT_PATH`.

6. Apply schema:

   ```bash
   npm run db:migrate
   ```

Neon branches used by this project:

| Neon branch  | Use                                                  |
| ------------ | ---------------------------------------------------- |
| `production` | Vercel Production                                    |
| `staging`    | Vercel Preview / `main` deploys                      |
| `dev`        | Local development (optional personal branches later) |

Project context is stored in [`.neon`](.neon) (safe to commit; no secrets).

## Local testing with Firebase emulators

The backend verifies Firebase ID tokens and looks up the signed-in user by Firebase UID. The Auth emulator issues tokens for local test accounts. The Firestore emulator stores the availability document created during Resell registration. Both emulators and the local API listen on loopback.

### First-time setup

1. Install the [Firebase CLI](https://firebase.google.com/docs/cli#install_the_firebase_cli) and Java 21 or newer. Check with `firebase --version` and `java -version`. The emulator configuration in this repo uses the demo project `demo-resell-local` and works without a Firebase login or service-account key. [Firebase emulator setup](https://firebase.google.com/docs/emulator-suite/install_and_configure)
2. Follow the Node and database setup above. Use a development database with the Resell schema applied. Set `DATABASE_URL` and `DATABASE_URL_UNPOOLED` in `.env` to the development database. If the database still needs the historical `AuthorizationRefactor` migration, use an already-migrated development branch as your starting point. That migration has its own Firebase requirements.
3. Add `EMAIL_WHITELIST=resell-test@example.com` to `.env`. If the variable already has entries, append the test address to the comma-separated list. Leave `IS_PROD` unset or set it to `false`.
4. Start both processes using the commands below (`npm run dev:emulators` and `npm run dev:local`). In the [Emulator Suite UI](http://127.0.0.1:4000/auth), add an Authentication user with the email `resell-test@example.com` and a password used only for local testing.
5. Sign in using the command below and authorize in Swagger. Run **POST /user/create** once to create the Resell profile in the development database. Use the email you signed in with and choose unique profile identifiers if you share the database. This is a sample request body.

   ```json
   {
     "username": "resell-local-test",
     "netid": "resell-local-test",
     "givenName": "Local",
     "familyName": "Tester",
     "photoUrl": "",
     "venmoHandle": "",
     "email": "resell-test@example.com",
     "googleId": "resell-test@example.com",
     "bio": "",
     "fcmToken": "local-test-placeholder"
   }
   ```

### Each testing session

1. From the repo root, run `npm run dev:emulators` in one terminal. Wait for the Auth, Firestore, and Emulator UI addresses to appear.
2. In another terminal, run `npm run dev:local`. Check the API and database at [localhost:3000/health](http://localhost:3000/health).
3. Sign in to the Auth emulator. Run the below command in another terminal, replacing `YOUR_TEST_PASSWORD` with your local test password and copy `idToken` from the JSON response. Run this again when the token expires. [Firebase Auth REST API](https://firebase.google.com/docs/reference/rest/auth)

   ```bash
   curl --fail-with-body -sS \
     'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key' \
     -H 'Content-Type: application/json' \
     --data '{"email":"resell-test@example.com","password":"YOUR_TEST_PASSWORD","returnSecureToken":true}'
   ```

4. In [Swagger](http://localhost:3000/api-docs/), click **Authorize** and paste the ID token itself. Try **GET /post** for an authenticated request as a regular user. For curl, use the `Authorization: Bearer <idToken>` header.
5. Stop both processes with Ctrl+C. The emulator command saves Auth users and Firestore documents in the ignored `.firebase/local` directory on clean shutdown and imports them on the next run. Keeping that state preserves the UID linked to your Resell profile.

If the API says **User not found**, register the signed-in account through **POST /user/create**. If you reset emulator data, recreating a test account can assign it a new UID. Use a new test email and unique profile identifiers, or start with a fresh development database.

The legacy `GET /api/authToken/` and `POST /api/authToken/create/` routes have been removed. The backend rejects emulator settings on Vercel and outside local development. Keep `FIREBASE_AUTH_EMULATOR_HOST` and `FIRESTORE_EMULATOR_HOST` out of Production and Preview settings. [Firebase Auth Emulator token behavior](https://firebase.google.com/docs/emulator-suite/connect_auth)

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
