# Redis configuration

Add the TCP connection string to the Next.js application's `.env` (or production
environment), then restart every application process:

```dotenv
REDIS_URL=rediss://default:YOUR_PASSWORD@definite-labrador-244436.upstash.io:6379
# Example for a reverse proxy that overwrites X-Forwarded-For with the real client IP:
RATE_LIMIT_IP_HEADER=x-forwarded-for
# Optional; use a different prefix for each app/environment sharing the database:
REDIS_KEY_PREFIX=rh:production
```

The `ioredis` client uses TCP with TLS for `rediss://`; no Upstash REST credentials
are needed. Credentials stay server-side. URL-encode special characters in the
password. The connection is lazy and reused per Node process, with two-second
connection/command timeouts and no offline command queue.

## Proxy header

Set `RATE_LIMIT_IP_HEADER` only to a header your ingress **overwrites**. For Nginx
directly facing visitors, use `proxy_set_header X-Forwarded-For $remote_addr` and
prevent public traffic from reaching the Next.js port directly. If there is a CDN
or another proxy in front, configure trusted real-IP handling at your ingress first.
Do not accept an arbitrary client-provided forwarding chain as the client IP.

Without a configured header, requests share an `unknown` IP bucket. Account and
membership-card limits still apply, but unrelated visitors also share IP limits.

## Limits

Edit `RATE_LIMITS` in `lib/constants.ts`, then rebuild/restart. All windows are
rolling windows, stored in Redis sorted sets and checked atomically using Redis
server time. Website and mobile authentication share normalized account buckets.
Keys hash IP/account/card identifiers instead of storing them as plaintext.

| Operation | Account/card allowance | IP allowance |
| --- | --- | --- |
| Login | 6 / 15 minutes | 60 / 15 minutes |
| Signup | 5 / 15 minutes | 30 / 15 minutes |
| Forgot password | 3 / 5 minutes | 30 / 5 minutes |
| Resend email code | 3 / 5 minutes | 30 / 5 minutes |
| Confirm email | 6 / 5 minutes | 60 / 5 minutes |
| Reset password | 6 / 5 minutes | 60 / 5 minutes |
| Mobile refresh | — | 120 / minute |
| Public API GET | — | 180 / minute per route template |
| Public API writes | — | 30 / minute per route template |
| Contact form | — | 5 / 10 minutes |
| Browser logs | — | 100 / minute |
| Workshop membership OTP sends | 3 / 5 minutes across all workshops | Public API write limit |
| Workshop membership incorrect OTPs | 5 per challenge | Public API write limit |

Auth.js credential login is limited inside `authorize`, so direct callback requests
cannot bypass it. Other website authentication actions and mobile authentication
routes check limits before Cognito calls. Public API limits run in `withApiLogging`
before handlers, using their route templates so changing IDs cannot create new
buckets. Provider callbacks, admin routes, and private mobile/dashboard endpoints
are excluded from the generic public limiter. Their existing authorization remains.

API limits return HTTP 429 with `Retry-After`, `retryAfter`, and a readable message.
If Redis is absent or unavailable, protected operations return 503 instead of
bypassing limits. Website actions return readable errors through the existing forms;
Auth.js login uses its existing `TOO_MANY_ATTEMPTS` / `LOGIN_UNAVAILABLE` codes.

## Workshop membership verification

OTP hashes, ownership, and verified sessions remain in PostgreSQL. Send timestamps
and incorrect-attempt counters live in Redis. The old database `sent_at` and
`attempts` columns are retained for schema compatibility and are no longer used.
No database migration is required.

The OTP validity (5 minutes), incorrect-attempt allowance (5), send allowance
(3 / 5 minutes), and verified-session validity (15 minutes) are all configured in
`RATE_LIMITS.workshopMember`. Email and UI expiry/allowance text use these constants.

Sending still locks the card in PostgreSQL; verification still locks the challenge.
An incorrect counter is initialized with the challenge lifetime. Missing counters
deny verification rather than resetting the allowance. Failed email delivery counts
toward sending limits and invalidates that OTP. Redis outages cannot issue or verify
an OTP. Registration validates the cookie's token hash and session expiry, and
rechecks live membership eligibility.

Use a non-evicting Redis configuration for security counters, with adequate memory.
Do not flush these keys to clear content caches. A Redis data reset resets sending
allowances and requires a new OTP for challenges whose counters disappeared.
Deploy the new version across all workers together; old versions use DB counters.

## Data caching

`REDIS_CACHE_TTL_SECONDS` in `lib/constants.ts` controls these defaults:

| Data | TTL |
| --- | --- |
| Public course catalogue/details/curriculum | 300 seconds |
| Public workshop listings/details/gallery | 120 seconds |
| Approved course reviews | 300 seconds |
| Admin dashboard aggregates | 60 seconds |

The website and mobile catalogue API use the same cached helper. Membership
discounts, checkout pricing, enrolments, private media grants, and learning progress
continue using live database checks. Admin authorization runs before every
statistics cache read. Statistics may lag by up to one minute.

Course/lesson create, update, delete, and reorder operations invalidate the course
namespace. Workshop/gallery writes invalidate workshops. Review moderation,
resubmission of approved reviews, profile updates, and account deletion invalidate
reviews. Generation keys hide old values and late fills across all processes;
expired values are removed by Redis. Dates are restored as Date objects on reads.
Concurrent misses are coalesced within each process. Cache failures fall back to
PostgreSQL. If an invalidation fails during an outage, existing entries may be
served until their TTL expires. Diagnostic logs report hits/misses; cache failure
warnings are bounded to one per minute per process and never log connection details.

Redis data invalidation is separate from Next.js route revalidation; the admin
actions perform both for affected public pages. Existing blog caching is unchanged.

## Verification

```sh
npx tsc --noEmit
node --test tests/*.test.cjs
# Against a disposable local Redis instance only:
REDIS_TEST_URL=redis://127.0.0.1:16379 node --test tests/redis.test.cjs
```

The integration suite uses only `REDIS_TEST_URL`, writes to a unique prefix, and
removes only its own keys. It never falls back to the application's `REDIS_URL`.
