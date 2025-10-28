# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Resell is a Cornell marketplace backend built with TypeScript, Express, TypeORM, and PostgreSQL. It uses Firebase for authentication, pgvector for semantic search, and TensorFlow.js for ML-based features.

## Development Commands

### Setup
```bash
npm install
# Copy .env_template to .env and fill in credentials
# Ensure resell.pem and Firebase service account JSON are in project root
```

### Running the Application
```bash
npm run dev          # Development mode with hot reload (tsc-watch)
npm start            # Production mode
```

### Database
```bash
npm run db:migrate                # Run pending migrations
npm run db:migrate:generate init  # Generate migration from entity changes
npm run db:migrate:create         # Create empty migration
npm run db:revert                 # Revert last migration
npm run db:seed                   # Seed database (dev only)
```

### Testing
```bash
npm test            # Run all tests with Jest
# Note: Update FIREBASE_SERVICE_ACCOUNT_PATH in jest.config.js to your local path
```

### Swagger Documentation
- Available at `http://localhost:3000/api-docs` when server is running
- Defined in `swaggerDef.js` (some endpoints) and `swagger.json` (full spec)

## Architecture

### Layered Architecture Pattern
The codebase follows a strict layered architecture:

**Controller → Service → Repository → Model**

1. **Controllers** (`src/api/controllers/`)
   - Handle HTTP requests/responses using `routing-controllers` decorators
   - Use `@JsonController`, `@Get`, `@Post`, `@Delete`, etc.
   - Inject services via constructor
   - Extract user from `@CurrentUser()` decorator (populated by auth middleware)

2. **Services** (`src/services/`)
   - Contain business logic
   - Use `@Service()` decorator and `@InjectManager()` for EntityManager
   - Manage transactions via `TransactionsManager` wrapper
   - Call repositories for data access

3. **Repositories** (`src/repositories/`)
   - Handle database queries using TypeORM
   - Use `@EntityRepository` decorator
   - Extend `AbstractRepository<T>`
   - Use QueryBuilder for complex queries with relations

4. **Models** (`src/models/`)
   - TypeORM entities defining database schema
   - Use decorators: `@Entity`, `@Column`, `@ManyToOne`, `@OneToMany`, etc.
   - Located in `src/models/*.ts`

### Key Architectural Patterns

**Transaction Management:**
Services use `TransactionsManager` for database transactions:
```typescript
return this.transactions.readOnly(async (transactionalEntityManager) => {
  const repo = Repositories.post(transactionalEntityManager);
  return await repo.getPostById(id);
});
```

**Authentication:**
- Firebase Admin SDK verifies JWT tokens in `currentUserChecker` (app.ts:67-130)
- Only Cornell emails (@cornell.edu) are allowed
- User is automatically injected into controller methods via `@CurrentUser()`
- New users get temporary UserModel on `/api/user/create` or `/api/authorize` routes

**Dependency Injection:**
- Uses TypeDI container with `routing-controllers` and `typeorm-typedi-extensions`
- Services auto-injected into controllers
- EntityManager injected via `@InjectManager()`

### Special Features

**pgvector Semantic Search:**
- Uses pgvector extension for vector similarity search on posts/requests
- Embeddings generated via TensorFlow.js Universal Sentence Encoder
- See `src/utils/SentenceEncoder.ts` for encoder loading
- Posts/Requests store embeddings in `embedding` column (float array)

**Image Upload:**
- Handled by `ImageController` and `ImageService`
- Uses `multer` for multipart/form-data
- Uploads to Google Cloud Storage bucket (configured via env vars)

**Push Notifications:**
- `NotifService` uses Expo SDK to send push notifications
- FCM tokens stored in `FcmTokenModel`
- Supports request matches, discounts, and general notifications

## Database

### Connection
- Configuration in `ormconfig.ts`
- Uses environment variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- SSL enabled in production (`IS_PROD=true`)

### Migrations
- Located in `src/migrations/`
- Auto-run on application start (`migrationsRun: true`)
- **Important:** When generating migrations, delete old migration files if starting fresh (see README "Migration debugging")

### Required Extensions
- **pgvector**: Required for vector similarity search
  ```bash
  psql -U postgres -d resell-dev -c "CREATE EXTENSION vector;"
  ```

## Environment Variables

Required in `.env` (see `.env_template`):
- **Database:** `DB_HOST`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_PORT`
- **Firebase:** `FIREBASE_SERVICE_ACCOUNT_PATH` (path to JSON file)
- **OAuth:** `OAUTH_BACKEND_ID`, `OAUTH_CLIENT_SECRET`, `OAUTH_ANDROID_CLIENT`, `OAUTH_IOS_ID`
- **Image Upload:** `UPLOAD_BUCKET_NAME`, `IMAGE_UPLOAD_URL`, `UPLOAD_SIZE_LIMIT`
- **Server:** `HOST`, `PORT`, `IS_PROD`
- **Admin:** `ADMIN_EMAILS` (comma-separated)

**Additional Required Files:**
- `resell.pem` - Private key for authentication (project root)
- Firebase service account JSON file (path specified in env)

## Testing

- Tests use Jest with `ts-jest` preset
- Located in `src/tests/`
- Test structure mirrors main code (controllers, services, etc.)
- Uses `ts-mockito` for mocking
- **Important:** Tests run with `maxWorkers: 1` to avoid database conflicts
- Update `FIREBASE_SERVICE_ACCOUNT_PATH` in `jest.config.js` to your local path before running tests

## API Structure

All API routes prefixed with `/api/` (configured in `app.ts:64`)

### Main Resources
- **Auth:** `/api/auth` - User authorization and token management
- **User:** `/api/user/` - User CRUD operations
- **Post:** `/api/post/` - Marketplace listings
- **Request:** `/api/request/` - User requests for items
- **Feedback:** `/api/feedback/` - User feedback
- **Report:** `/api/report/` - Content moderation
- **Transaction:** `/api/transaction/` - Purchase transactions
- **Notification:** `/api/notif/` - Push notifications
- **Image:** `/api/image/` - Image uploads
- **Chat:** `/api/chat/` - Messaging

### Special Routes
- **Admin Reports UI:** `/api/reports/admin/` - Pug template view for reports (requires admin user)

## Common Patterns

### Creating New Endpoints

1. Define request/response types in `src/types/`
2. Add model if needed in `src/models/`
3. Create repository methods in `src/repositories/`
4. Implement business logic in service in `src/services/`
5. Add controller method with routing decorators in `src/api/controllers/`
6. Update Swagger documentation in `swagger.json` or `swaggerDef.js`

### Adding a Migration

When entity changes are made:
```bash
npm run db:migrate:generate <migration-name>
npm run db:migrate
```

### Working with Relations

Always use `leftJoinAndSelect` in repository queries to load relations:
```typescript
return await this.repository
  .createQueryBuilder("post")
  .leftJoinAndSelect("post.user", "user")
  .leftJoinAndSelect("post.categories", "categories")
  .where("post.id = :id", { id })
  .getOne();
```

### Pagination

Use skip/take pattern with two-step query (IDs first, then full objects):
```typescript
const postIds = await repo.createQueryBuilder("post")
  .select("post.id")
  .skip(skip)
  .take(limit)
  .getMany();
const ids = postIds.map(p => p.id);
return await repo.createQueryBuilder("post")
  .where("post.id IN (:...ids)", { ids })
  .getMany();
```

## Important Notes

- **TypeORM version:** 0.2.45 (older version, some APIs differ from 0.3.x)
- **Synchronize is disabled:** Always use migrations for schema changes
- **Firebase auth is strict:** All endpoints except user creation require authenticated Cornell users
- **Admin functionality:** Admin users have additional permissions (check `user.admin` flag)
- **Soft deletes:** Users can be soft deleted (check `user.isActive` flag)
- **Archived posts:** Posts have `archive` flag instead of hard delete
