# Backend security review — November 18, 2026

**Decision: do not deploy this revision until the critical authentication bypass and high-priority authorization failures are fixed.** This is a repository review with local mocked verification, not certification of the entire mobile/cloud system. No production accounts, databases, or notification endpoints were exercised.

## Scope and verification

- Inventoried all 117 decorated controller routes. 48 lack `@CurrentUser`; public reads are not automatically vulnerabilities. There is no global authentication middleware or `@Authorized` enforcement in this application. The installed routing-controllers implementation calls `currentUserChecker` only for current-user parameters.
- Inspected authentication bootstrap, registered middleware/controllers, high-risk service and repository paths, notification/chat behavior, validation, outbound requests, database connection configuration, and deployment workflows.
- Ran 11 temporary audit assertions: a mocked arbitrary-UID token-minting flow, nine unguarded route metadata checks, and a protected-route control. All passed, confirming the reported unsafe behavior rather than demonstrating security. The temporary audit harness was removed from the source tree afterward.
- Reran the 19 notification/chat tests successfully. These check behavior with mocks, not actual mobile delivery or production access controls.
- Scanned currently tracked files for private-key blocks, AWS/GitHub token patterns, and credential-bearing Postgres URLs; no matches. The Firebase service-account JSON is untracked/ignored. The tracked SQL dump contains COPY data for migration records only. This limited scan does not rule out other secret formats or historical Git exposure.
- Queried npm's live audit registry for production dependencies: 21 affected package entries (2 critical, 6 high, 10 moderate, 3 low). These are registry classifications, not 21 proven remotely exploitable application flaws.

## Confirmed release blockers

### 1. Critical: unauthenticated login-token minting

`src/api/controllers/AuthToken.ts:26` accepts a body field named `token`, passes it directly to Firebase Admin `createCustomToken` as a UID, exchanges the custom token, and returns an ID token. This registered route has no identity or authorization check. A caller who knows an existing UID can request credentials for that identity, subject to the configured Firebase exchange succeeding. Public profile/transaction endpoints expose UIDs, including potentially privileged users. Line 52 also logs the resulting bearer credential.

**Fix:** remove the custom-token mint/exchange route from public routing. Use the normal Firebase client sign-in flow and verify resulting ID tokens server-side. Remove token logging. If deployed, investigate access logs and revoke affected sessions; this review did not determine whether exploitation occurred. The Firebase web API key itself is not the core vulnerability.

### 2. High: anonymous destructive account/listing/request operations

- `src/api/controllers/UserController.ts:133`: soft-deletes an arbitrary user; `UserService.ts:324` archives their posts and requests without an actor check.
- `src/api/controllers/PostController.ts:273`: archives all listings belonging to a supplied UID.
- `src/api/controllers/RequestController.ts:53`, `:62`, `:77`: creates requests for another user, deletes any known request, or archives another user's requests.
- `src/api/controllers/FeedbackController.ts:49`, `:60`: anonymous impersonated creation and arbitrary deletion.
- `src/api/controllers/TransactionReviewController.ts:46`, `:51` and `UserReviewController.ts:43`: anonymous review creation/forgery and transaction-review deletion.

**Fix:** authenticate every mutation, derive the actor from the verified token, and enforce owner/participant/admin permissions in the service. Authentication alone does not fix cross-user access.

### 3. High: anonymous transaction disclosure and mutation

`src/api/controllers/TransactionController.ts:28` exposes all transactions; repository reads join buyer, seller, and listing entities. Create (`:61`) and completion (`:72`) have no authenticated actor. `TransactionService.ts:110` permits completion by transaction ID, marks the listing sold, and sends notifications. Existence checks do not establish authorization.

**Fix:** restrict reads to participants or explicitly authorized admins; authorize creation/completion and verify seller ownership of the listing. Return deliberately selected response fields.

### 4. High: arbitrary push-notification sending

`src/api/controllers/NotifController.ts:34` accepts recipient email, title, body, and data without authentication; discount and match routes are similarly exposed. The service performs a lookup and sends through the application's trusted FCM credentials. Anonymous callers can impersonate app notifications and generate spam to known accounts.

**Fix:** remove externally callable send routes if they are internal-only, or restrict them to an authenticated administrative/service principal. User-facing flows should construct recipient/content server-side. Add abuse controls.

### 5. High: any authenticated user can change another listing's price

`src/services/PostService.ts:558` receives the authenticated `user` but never checks it against `post.user.firebaseUid`; it immediately calls the price-edit repository method for the supplied listing ID.

**Fix:** require ownership (or an explicitly designed admin permission) before saving; validate finite, nonnegative price values. Add a non-owner rejection test.

### 6. High: proposal messages permit forged acceptance and identity

`src/api/controllers/ChatController.ts:212` checks existing-chat membership, but trusts `chatBody.senderId` and client-supplied acceptance/times. A buyer can claim the seller's identity and trigger a transaction plus a notification saying the seller accepted. No referenced pending proposal, accepting-party authorization, or replay/idempotency check is required. Availability/initial-proposal/cancellation routes similarly lack sender-to-authenticated-user binding; new-chat paths skip membership validation when no document exists.

**Fix:** bind sender IDs to authenticated users across every chat write, validate new participants and listing ownership, and require acceptance of a stored pending proposal by its intended counterparty. Make repeated acceptance idempotent. The new ordinary-message sender checks do not protect these older routes.

## Additional security issues and deployment checks

1. **Email verification and inactive accounts:** `src/app.ts:60` checks the email string's domain/allowlist but not `email_verified`, and returns existing inactive users without a general rejection. The public Firebase account-creation route uses supplied email/password. Email-domain ownership can be bypassed when password sign-in is enabled unless verified email is enforced. Check production provider settings, require verified identity as appropriate, and reject disabled/inactive app accounts consistently.
2. **Notification consent/blocking:** `src/repositories/FcmTokenRepository.ts:9` fetches tokens without checking `notificationsEnabled`. The new ordinary-message push flow does not check either-direction blocking or inactive recipients. This can deliver messages after opt-out or blocking. Respect those controls before sending; verify intended product behavior with the mobile clients.
3. **Privacy:** unauthenticated profile/email/block-list/availability endpoints return user entities or schedules. For example, `UserController.ts:103` exposes block relationships, and `AvailabilityController.ts:45` exposes a supplied user's schedule. Public transaction reads expose additional identity/activity data. Define public versus private DTOs and permission checks rather than returning entire entities.
4. **Runtime validation and abuse limits:** most body types are TypeScript interfaces, not runtime-validated DTO classes. Global validation settings do not create validators for erased interfaces. Validate identity fields, numeric values, arrays, text lengths, timestamps, pagination bounds, and notification data. No application rate limiter was found. Anonymous image uploads and account creation need authentication/abuse controls and explicit size limits; upload destinations are configuration-derived, not directly user-controlled URLs in the reviewed code.
5. **Database TLS:** `src/utils/DB.ts:13` / `:28` and `ormconfig.ts` explicitly disable certificate verification in fallback SSL configuration. Actual production behavior depends on connection URL SSL options. Require verified TLS with the provider's supported configuration; do not change certificates blindly.
6. **Logs/errors:** token logging above is critical. Other routes log whole user/chat records; the default error handler returns raw error messages and the health endpoint can return raw database error objects. Redact sensitive values and return generic unexpected-server-error responses.
7. **CI:** `.github/workflows/migrate-neon.yml` interpolates the free-form workflow-dispatch branch input directly into shell source. Use an environment variable or a fixed choice input before the shell allowlist. The workflow runs migrations on main/release pushes; do not assume pushing is operationally inert. The retired Docker build uses `COPY . .` with no tracked `.dockerignore`, so local builds may include ignored credentials; exclude secrets before reusing it.
8. **Dependencies:** prioritize reachable body-parser and ORM findings; several other findings may require unused features or configurations. Do not run a blind forced upgrade: npm proposes a major TypeORM change. Validate upgrades against migrations and API tests.
9. **Firestore/cloud boundary:** no deployed Firestore rules, IAM policies, Firebase provider configuration, APNs credentials, Vercel protections, or mobile-client code were available for verification. Firebase Admin writes bypass client rules, so backend checks remain necessary. Direct mobile Firestore writes would also bypass the newly added HTTP message-notification flow.

## Remediation order

1. Remove public UID-to-token minting and bearer-token logging.
2. Close anonymous mutations/push sending; add service-level ownership/participant checks, including price edits and proposal acceptance.
3. Add regression tests that expect unauthorized/non-owner calls to fail and legitimate clients to succeed.
4. Resolve identity-verification, privacy, notification preference/blocking, and runtime-input validation gaps.
5. Upgrade reachable vulnerable dependencies and verify deployment configuration in staging before release.

No application security fixes were made during this review. The existing uncommitted message-notification changes were preserved.

## Production dependency audit inventory

| Package | Severity | Direct | Fix reported |
|---|---|---|---|
| @fastify/busboy | high | False | True |
| @google-cloud/firestore | moderate | False | firebase-admin 12.1.0 (major) |
| @google-cloud/storage | moderate | False | firebase-admin 12.1.0 (major) |
| @grpc/grpc-js | high | False | True |
| body-parser | high | True | True |
| brace-expansion | high | False | True |
| cookie | low | False | routing-controllers 0.11.3 (major) |
| fast-xml-parser | low | False | True |
| firebase-admin | moderate | True | firebase-admin 12.1.0 (major) |
| gaxios | moderate | False | True |
| google-gax | moderate | False | firebase-admin 12.1.0 (major) |
| js-yaml | high | False | True |
| node-forge | high | False | True |
| proxy-addr | critical | False | True |
| qs | moderate | False | True |
| retry-request | moderate | False | firebase-admin 12.1.0 (major) |
| routing-controllers | low | True | routing-controllers 0.11.3 (major) |
| teeny-request | moderate | False | firebase-admin 12.1.0 (major) |
| typeorm | critical | True | typeorm 1.1.3 (major) |
| uuid | moderate | False | typeorm 1.1.3 (major) |
| xml2js | moderate | False | typeorm 1.1.3 (major) |

## Controller route inventory

Absence of `CurrentUser` is a review signal, not automatically a vulnerability; some reads should be public. This inventory excludes manually registered Express health/admin/cron routes, which were inspected separately.

| Method | Route | CurrentUser | Source |
|---|---|---|---|
| POST | `/api/auth/` | yes | AuthController.ts:15 |
| POST | `/api/authToken/create/` | no | AuthToken.ts:12 |
| GET | `/api/authToken/` | no | AuthToken.ts:26 |
| GET | `/api/availability/` | yes | AvailabilityController.ts:23 |
| GET | `/api/availability/user/:userId` | no | AvailabilityController.ts:41 |
| POST | `/api/availability/update/` | yes | AvailabilityController.ts:69 |
| POST | `/api/chat/message/:id` | yes | ChatController.ts:65 |
| POST | `/api/chat/availability/:id` | yes | ChatController.ts:138 |
| POST | `/api/chat/proposal/initial/:id` | yes | ChatController.ts:179 |
| POST | `/api/chat/proposal/:id` | yes | ChatController.ts:212 |
| POST | `/api/chat/proposal/cancel/:id` | yes | ChatController.ts:340 |
| POST | `/api/chat/:chatId/message/:messageId` | yes | ChatController.ts:372 |
| GET | `/api/feedback/` | no | FeedbackController.ts:27 |
| GET | `/api/feedback/id/:id/` | no | FeedbackController.ts:33 |
| GET | `/api/feedback/userId/:id/` | no | FeedbackController.ts:40 |
| POST | `/api/feedback/` | no | FeedbackController.ts:49 |
| DELETE | `/api/feedback/id/:id/` | no | FeedbackController.ts:60 |
| POST | `/api/feedback/search/` | no | FeedbackController.ts:67 |
| POST | `/api/image/` | no | ImageController.ts:14 |
| GET | `/api/notif/recent` | yes | NotifController.ts:14 |
| GET | `/api/notif/new` | yes | NotifController.ts:19 |
| GET | `/api/notif/last7days` | yes | NotifController.ts:24 |
| GET | `/api/notif/last30days` | yes | NotifController.ts:29 |
| POST | `/api/notif/` | no | NotifController.ts:34 |
| POST | `/api/notif/discount` | no | NotifController.ts:39 |
| POST | `/api/notif/request-match` | no | NotifController.ts:44 |
| DELETE | `/api/notif/id/:id` | yes | NotifController.ts:49 |
| POST | `/api/notif/read/:id` | yes | NotifController.ts:58 |
| GET | `/api/post/` | yes | PostController.ts:43 |
| GET | `/api/post/id/:id/` | yes | PostController.ts:52 |
| GET | `/api/post/userId/:id/` | yes | PostController.ts:60 |
| POST | `/api/post/` | yes | PostController.ts:68 |
| DELETE | `/api/post/id/:id/` | yes | PostController.ts:99 |
| POST | `/api/post/search/` | yes | PostController.ts:107 |
| POST | `/api/post/filterByCategories/` | yes | PostController.ts:119 |
| POST | `/api/post/filterByEventTags/` | yes | PostController.ts:136 |
| POST | `/api/post/event-tags/add/:id/` | yes | PostController.ts:149 |
| DELETE | `/api/post/event-tags/remove/:id/` | yes | PostController.ts:158 |
| POST | `/api/post/filterByPrice/` | yes | PostController.ts:167 |
| POST | `/api/post/filterPriceHighToLow/` | yes | PostController.ts:184 |
| POST | `/api/post/filterPriceLowToHigh/` | yes | PostController.ts:195 |
| POST | `/api/post/filterNewlyListed/` | yes | PostController.ts:206 |
| POST | `/api/post/filterByCondition/` | yes | PostController.ts:217 |
| POST | `/api/post/filter/` | yes | PostController.ts:234 |
| GET | `/api/post/archive/` | yes | PostController.ts:251 |
| GET | `/api/post/archive/userId/:id/` | no | PostController.ts:258 |
| POST | `/api/post/archive/postId/:id/` | yes | PostController.ts:265 |
| POST | `/api/post/archiveAll/userId/:id/` | no | PostController.ts:273 |
| GET | `/api/post/save/` | yes | PostController.ts:280 |
| POST | `/api/post/save/postId/:id/` | yes | PostController.ts:287 |
| POST | `/api/post/unsave/postId/:id/` | yes | PostController.ts:295 |
| GET | `/api/post/isSaved/postId/:id/` | yes | PostController.ts:303 |
| POST | `/api/post/edit/postId/:id/` | yes | PostController.ts:311 |
| GET | `/api/post/similar/postId/:id/` | yes | PostController.ts:324 |
| GET | `/api/post/suggested/` | yes | PostController.ts:332 |
| POST | `/api/post/view/postId/:id/` | yes | PostController.ts:340 |
| GET | `/api/post/dailyPicks/` | yes | PostController.ts:348 |
| GET | `/api/post/trending/` | yes | PostController.ts:356 |
| GET | `/api/post/searchSuggestions/:searchIndex/` | no | PostController.ts:373 |
| GET | `/api/post/purchaseSuggestions/` | yes | PostController.ts:385 |
| GET | `/api/report/admin/all/` | yes | ReportController.ts:32 |
| GET | `/api/report/admin/post/` | yes | ReportController.ts:39 |
| GET | `/api/report/admin/profile/` | yes | ReportController.ts:46 |
| GET | `/api/report/admin/message/` | yes | ReportController.ts:53 |
| GET | `/api/report/id/:id/` | yes | ReportController.ts:60 |
| GET | `/api/report/reporter/id/:id/` | yes | ReportController.ts:68 |
| POST | `/api/report/post/` | yes | ReportController.ts:78 |
| POST | `/api/report/profile/` | yes | ReportController.ts:86 |
| POST | `/api/report/message/` | yes | ReportController.ts:94 |
| POST | `/api/report/resolve/reportId/:id/` | yes | ReportController.ts:102 |
| DELETE | `/api/report/delete/:id/` | yes | ReportController.ts:110 |
| GET | `/api/request/` | no | RequestController.ts:33 |
| GET | `/api/request/id/:id/` | no | RequestController.ts:39 |
| GET | `/api/request/userId/:id/` | no | RequestController.ts:46 |
| POST | `/api/request/` | no | RequestController.ts:53 |
| DELETE | `/api/request/id/:id/` | no | RequestController.ts:62 |
| POST | `/api/request/archive/requestId/:id/` | yes | RequestController.ts:69 |
| POST | `/api/request/archiveAll/userId/:id/` | no | RequestController.ts:77 |
| GET | `/api/request/matches/id/:id/:time?/` | no | RequestController.ts:86 |
| GET | `/api/search/` | yes | SearchController.ts:43 |
| POST | `/api/search/` | yes | SearchController.ts:72 |
| GET | `/api/transaction/` | no | TransactionController.ts:27 |
| GET | `/api/transaction/id/:id/` | no | TransactionController.ts:32 |
| GET | `/api/transaction/buyerId/:id/` | no | TransactionController.ts:41 |
| GET | `/api/transaction/sellerId/:id/` | no | TransactionController.ts:51 |
| POST | `/api/transaction/` | no | TransactionController.ts:61 |
| POST | `/api/transaction/complete/id/:id/` | no | TransactionController.ts:72 |
| GET | `/api/transaction/postId/:id/` | no | TransactionController.ts:85 |
| GET | `/api/transactionReview/` | no | TransactionReviewController.ts:23 |
| GET | `/api/transactionReview/id/:id/` | no | TransactionReviewController.ts:36 |
| GET | `/api/transactionReview/transactionId/:id/` | no | TransactionReviewController.ts:41 |
| POST | `/api/transactionReview/` | no | TransactionReviewController.ts:46 |
| DELETE | `/api/transactionReview/id/:id/` | no | TransactionReviewController.ts:51 |
| POST | `/api/user/create/` | yes | UserController.ts:16 |
| GET | `/api/user/` | yes | UserController.ts:24 |
| POST | `/api/user/` | yes | UserController.ts:30 |
| GET | `/api/user/id/:id/` | no | UserController.ts:41 |
| GET | `/api/user/googleId/:id/` | no | UserController.ts:48 |
| GET | `/api/user/postId/:id/` | no | UserController.ts:53 |
| POST | `/api/user/email/` | no | UserController.ts:58 |
| POST | `/api/user/admin/` | yes | UserController.ts:67 |
| POST | `/api/user/block/` | yes | UserController.ts:77 |
| POST | `/api/user/unblock/` | yes | UserController.ts:85 |
| GET | `/api/user/blocked/id/:id/` | no | UserController.ts:95 |
| POST | `/api/user/follow/` | yes | UserController.ts:101 |
| POST | `/api/user/unfollow/` | yes | UserController.ts:106 |
| GET | `/api/user/followers/id/:id/` | no | UserController.ts:111 |
| GET | `/api/user/following/id/:id/` | no | UserController.ts:117 |
| DELETE | `/api/user/` | yes | UserController.ts:123 |
| DELETE | `/api/user/id/:id/` | yes | UserController.ts:128 |
| POST | `/api/user/softDelete/id/:id/` | no | UserController.ts:133 |
| POST | `/api/user/logout/` | no | UserController.ts:140 |
| GET | `/api/userReview/` | no | UserReviewController.ts:27 |
| GET | `/api/userReview/id/:id/` | no | UserReviewController.ts:38 |
| POST | `/api/userReview/` | no | UserReviewController.ts:43 |
| DELETE | `/api/userReview/id/:id/` | yes | UserReviewController.ts:48 |
| GET | `/api/version/` | no | VersionController.ts:13 |
