# Active database cleanup

This cleanup supports the existing Resell Neon databases in project
`fragrant-flower-02125519`. It does not bootstrap an empty database or replay the
historical migration chain.

## Targets and retained data

| Branch                                      | Database           | Role                                        |
| ------------------------------------------- | ------------------ | ------------------------------------------- |
| `dev` (`br-wispy-forest-audpsdxp`)          | `neondb`           | Active development                          |
| `staging` (`br-crimson-sound-auy345bq`)     | `neondb`           | Existing QA dataset                         |
| `production` (`br-weathered-wave-au5ygpff`) | `neondb`           | Live authoritative data                     |
| `dev-before-prod-copy-20261101`             | `import`, `neondb` | Retained historical backup; leave untouched |

The two new migrations restore required notification/save/block user references,
save/block primary keys and the established post/request/feedback and blocker
cascades. The blocked-user reference retains `NO ACTION`. They also remove the
post-condition default and mark only the proven artificial save timestamp
`2026-10-25 18:48:35.538726+00` as unknown (`NULL`). New saves retain `DEFAULT now()`.
Existing condition labels and genuine save dates remain unchanged.

There are no embedding, search-vector, vector-index or cache changes. Do not run
backfills or start application services as part of migration rehearsals.

## Executable migration inventory

Use `main`'s historical migration files plus:

- `AlignActiveDatabaseIntegrity1793574441324`
- `MarkKnownLegacySaveDatesUnknown1793574441325`

The earlier drafts in stash `0968f27` are retained as history, not restored into
the executable inventory: the compatibility draft changes search-vector storage.
The import rehearsal's existing draft ledger entries are historical artifacts.

Reconcile `release` explicitly: retire its release-only
`1771000000000-SyncProdSchema.ts` from `src/migrations` and match the reports
migration to `main`. Its legacy source remains available through Git history
(including commit `88eb4db`). Do not introduce `SyncProdSchema` into staging,
where it is not recorded and would attempt excluded vector/index work. A normal
`main` to `release` merge alone does not remove a release-only file.

Leave existing database migration rows, aliases and the three known duplicate
legacy names unchanged. Different legacy row counts do not establish schema age.
The guarded runner rejects any pending historical migration and any partial new
cleanup batch.

## Inventory and rehearsal

Use the Neon CLI's existing local login or supply `NEON_API_KEY` securely. The
runner does not read `.env`, accept arbitrary database URLs, initialize Firebase
or load the application. It resolves project/branch/endpoint identity using Neon
metadata and requires the existing direct endpoint and `neondb` database.

Inventory is the default and uses a read-only transaction:

```sh
npm run db:cleanup -- --branch-id br-shy-tree-auf4umh8
```

The existing `migration-review-prod` is an approved production-shaped rehearsal.
Create a fresh normal staging child named `cleanup-review-staging-<date>` with
schema and data. Its parent must be the approved staging branch. Other supported
temporary names are `cleanup-review-dev-<date>` and
`cleanup-review-production-<date>` with approved active parents.

Apply only after inventory, source review, local tests, and a captured recovery
point:

```sh
npm run db:cleanup -- --branch-id REHEARSAL_BRANCH_ID --apply
```

Every apply owns one transaction/QueryRunner, bounded lock/statement timeouts,
and a cooperating-runner advisory lock. It executes only the two prevalidated
cleanup migrations, verifies preservation and commits only on success. The lock
does not exclude ordinary `db:migrate`, deployment workflows, or application
writers; coordinate them separately.

Private JSON evidence defaults to ignored `secrets/cleanup-reports/` with owner-only
file permissions. Reports contain counts and digests, not connection credentials
or record payloads. An explicit `--report PATH` is available. Do not commit private
reports or database dumps.

## Validation

```sh
MIGRATION_TEST_DATABASE_URL=postgresql://YOUR_LOCAL_ROLE@localhost:5432/resell_migration_cleanup_test \
  npx jest src/tests/DatabaseCleanupMigration.test.ts \
  src/tests/DatabaseCleanupGuards.test.ts \
  src/tests/PostConditionValidation.test.ts --runInBand
npx tsc --noEmit --incremental false
```

Create the named disposable local database first. The SQL harness accepts only
that loopback database, disables synchronization, and uses narrow fixtures. Never
repoint the existing shared `DatabaseConnection` test helper at Neon: it uses
schema synchronization and `TRUNCATE CASCADE`.

Checks cover both starting schemas, constraints and cascade directions,
microsecond-accurate save dates, valid explicit condition labels, missing/blank
condition rejection, repeated migration bodies and atomic failure. Rehearsal
reports additionally fingerprint every business table (excluding only the
approved savedAt repair), excluded storage/index definitions, extension versions,
save-pair/date mappings, and historical migration rows.

API acceptance uses disposable identities and mocked messaging, Firestore and
embedding calls. Dev/staging contain tokens also present in production. Do not
exercise real notification, Firebase account or embedding-producing paths.
Unrelated PRs #189 and #190 retain their own review and release process.

## Active rollout and stopping conditions

1. Commit and independently review the exact tested code. Retain the old stash.
2. Inventory each active target again and capture a current private recovery point.
3. Apply and verify dev, then staging. Preserve their separate datasets.
4. Before production, establish a real write pause, drain in-flight writers, and
   confirm no competing generic migration run. Inventory and back up again.
5. Only the operator who established that pause may run:

   ```sh
   npm run db:cleanup -- --branch-id br-weathered-wave-au5ygpff --apply --writes-paused
   ```

   `--writes-paused` is an attestation, not a mechanism that pauses writes. If the
   pause cannot be established, stop before production. Vercel routing changes
   are outside this cleanup.

6. Verify records, schema, migration ledger, genuine dates and excluded-field
   fingerprints. A second apply must report no pending work. Keep production
   writes paused through deployment and the compatible API smoke checks.
7. Coordinate merges to `main`/`release` with the automatic migration workflow:
   the corresponding database must already be verified, so those jobs should
   report no pending cleanup work. Do not treat an application deployment as
   evidence that a migration succeeded. Stop for required repository approvals.
8. Resume production writes only after deployment and verification are complete.

Unexpected data/schema, unknown pending migrations, failed verification, missing
access or lock timeouts stop the run. Failures before a COMMIT attempt roll back
the transaction. If the COMMIT response is lost, the report/error identifies an
unknown outcome: inspect the ledger read-only before retrying. A confirmed commit
is reported as committed even if a later report or connection-cleanup step fails.
After commit, use a reviewed forward repair; automatic `down` is intentionally
unsupported. Any restore must account for writes after the recovery point.

After all active targets pass, retain the committed code and evidence, then delete
the temporary migration/rehearsal branches. Keep the old dev backup. Broader
account-deletion design, unrelated model-nullability differences, cosmetic
constraint/index renaming, fresh-database bootstrap and embedding work remain
outside this pass.
