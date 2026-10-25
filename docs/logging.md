# Application logging

The Next.js application uses `lib/logging` for structured JSON logs. No `.env` file was read or changed while implementing this.

## Configuration

Add these server-side environment variables yourself:

```dotenv
CLOUDWATCH_AWS_REGION=ap-south-1
CLOUDWATCH_AWS_ACCESS_KEY_ID=your_access_key_id
CLOUDWATCH_AWS_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDWATCH_LOG_GROUP_NAME=/rh-healthcare/nextjs
CLOUDWATCH_LOG_STREAM_PREFIX=rh-hospital
```

`CLOUDWATCH_LOG_STREAM_PREFIX` is optional and defaults to `rh-hospital`. For temporary AWS credentials, also set `CLOUDWATCH_AWS_SESSION_TOKEN`. An IAM role/default AWS credential chain can replace the access/secret key pair. These variables must never use the `NEXT_PUBLIC_` prefix. Existing payment, storage, email and Cognito credentials are independent of this logger.

Production uses reduced logging automatically. No additional environment variable is required. For a temporary investigation, set:

```dotenv
LOG_DIAGNOSTICS=true
```

Restart/redeploy after changing the flag. Remove it or set `LOG_DIAGNOSTICS=false` afterwards. Diagnostics default to on in development and off in production. Diagnostic events still use the `info` level; the three severities remain `info`, `warning`, and `error`.

## Production volume

- Normal API requests emit one completion summary containing status, duration and request ID. The request-start event is diagnostic-only.
- `/api/verify-payment` additionally emits a production `Request started` event after authentication and JSON parsing, with the top-level HDFC event ID in `metadata.hdfcWebhookId`. The generic diagnostic start is disabled for that route so the start event is not duplicated.
- Routine service, resource, HTTP and SDK operations do not emit start/success events unless diagnostics are enabled. They still report failures.
- Database query-dispatch events are diagnostic-only. They are not slow-query measurements or a record of successful execution.
- Explicit business milestones remain enabled: checkout creation, registration/enrolment creation, payment status changes, membership payment fulfillment, invoice enqueue acknowledgement and email acceptance. Repeated payment notifications and skipped invoice enqueues do not emit fresh completion milestones.
- The same exception object is reported once per request in normal production mode, alongside the API completion/failure summary. Returned failures do not add another generic warning when that operation already reported a failure. Independent failures in parallel operations are preserved.
- Successful admin proxy checks and successful browser-log ingestion do not add request summaries. Their failed responses remain visible. Browser production telemetry sends warnings/errors only; informational browser messages are not submitted.

For example, a successful request with three nested service calls, four database queries and one SDK call now emits **one API summary** instead of 14 routine records. Explicit business events add their own records. With diagnostics enabled, the detailed operation events are available again. Actual volume depends on the request path; this example is covered by a mocked regression test, not a production traffic measurement.

Give the logging identity these permissions in the configured region/account:

- `logs:CreateLogGroup` for the configured group.
- `logs:CreateLogStream` and `logs:PutLogEvents` for its streams.

The utility creates the group/streams on first use, tolerating concurrent creation. Configure the desired retention policy for the group in AWS. No infrastructure is deployed or changed until production code actually sends logs.

## Destinations and correlation

- Development: all three levels use `console.log` with JSON, with a fresh random UUID for each request. Incoming IDs are ignored in development.
- Production (`NODE_ENV=production`): logs go to CloudWatch. Request IDs use the incoming `x-vercel-id` header. If absent or invalid, the logger falls back to a UUID and sets `requestIdSource=uuid`.
- API handlers return `x-request-id` where their response headers are mutable. Async-local context preserves the ID across nested work and isolates simultaneous requests. Server actions and uncached server services also resolve the request header.
- Cached blog loaders do not read request headers. Cache refresh/background work without request context gets a UUID, so cached data is not made dependent on request headers. Do not call request APIs from cached callbacks when adding logging.
- Browser development logs stay in the browser console. In production, warnings/errors forward only allowlisted source/event names and severity to `/api/logs`; no form fields, raw exceptions or metadata are submitted. These events use the ingestion request's `x-vercel-id`. The endpoint requires the same origin, limits body size, validates events, and applies a best-effort per-instance volume bound. Repeated browser events are deduplicated for five seconds.

Records contain `timestamp`, `category`, `level`, `source`, `message`, `requestId`, `requestIdSource`, optional request method/route, and sanitized `metadata`. API routes use route templates rather than actual URLs/query strings.

Streams are separated as:

```text
rh-hospital/api/info/YYYY-MM-DD
rh-hospital/api/warning/YYYY-MM-DD
rh-hospital/api/error/YYYY-MM-DD
rh-hospital/resources/info/YYYY-MM-DD
rh-hospital/service/error/YYYY-MM-DD
rh-hospital/integration/warning/YYYY-MM-DD
```

Every category supports `info`, `warning`, and `error` (12 combinations). Dates use UTC.

## Coverage

| Category      | Coverage                                                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `api`         | All API route handlers, Auth.js handlers, the browser log endpoint, and admin proxy authorization responses                       |
| `resources`   | Database query dispatch and data-loading/email-record helpers                                                                     |
| `service`     | Server actions, membership/payment/access/playback services, browser event names, and unhandled Next.js rendering/action failures |
| `integration` | Cognito, SES, SQS, S3, HDFC, Apple purchase verification, SNS verification, and outbound HTTP calls                               |

API completion logs include HTTP status and duration. Statuses below 400 are `info`, 4xx are `warning`, and 5xx are `error`. Thrown application errors are `error`; expected Next.js redirect/not-found control flow is preserved. Service control-flow details are diagnostic-only, while API control-flow summaries remain `info`. Returned service failures are `warning`. AWS middleware records the command name and duration for failures (and successful operations when diagnostics are enabled), without its input/output, and uses provider HTTP status for rejected requests.

Diagnostic database logs describe **dispatch**, not successful completion: Drizzle's query hook does not report outcomes. Resource helpers report failures and diagnostic completion events separately. SQL text, parameter values, request/response bodies, credentials, tokens, cookies, email addresses, phone fields and error messages/stacks are not recorded. Error records preserve type/code/status/digest; source identifies the failing operation. Keep new messages static and use named metadata fields; never pass raw customer data or secrets as free-form strings.

## Adding logs

```ts
import { createLogger, runLoggedOperation } from "@/lib/logging";

const logger = createLogger("integration", "example-provider");
logger.diagnostic("Provider request started"); // info-level; gated by LOG_DIAGNOSTICS
logger.info("Provider request accepted", { status: 202 });
logger.warning("Provider rate limited", { status: 429 });
logger.error("Provider unavailable", { status: 503, error });

return runLoggedOperation("service", "example:process", async () => {
  // Existing operation; arguments and returned data are not logged.
});
```

Use `logger.info` for intentional business milestones, and `logger.diagnostic` for routine progress. Wrap new route handlers with `withApiLogging("/api/example/[id]", handler)`. Preserve server-action exports as async functions and call `runLoggedOperation` inside the body. Use `createClientLogger` from `lib/logging/client` in browser components, and add any new production browser warning/error event names to `browser-events.ts`.

## Delivery and failure behavior

Production logs are batched, sorted by timestamp, and sent through `next/server`'s `after()` so Vercel keeps the invocation alive after the response. Batches stay below [CloudWatch PutLogEvents limits](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html); sequence tokens are not required. AWS requests have bounded timeouts/retries. Background scripts should explicitly `await flushLogs()` before exiting.

CloudWatch configuration/network failures never fail business operations. They emit a transport failure event and the sanitized records to the platform console. Queues and individual event sizes are bounded. Delivery is best effort; retries/partial failure can duplicate records. No log collector can guarantee delivery if a process is killed before flushing.

## Validation

Run `node --test tests/logging.test.cjs` for production volume, the diagnostic override, exception deduplication, parallel independent failures, business-event preservation, request IDs, overlapping requests, levels, redaction, batching/stream separation, browser ingestion, response preservation and CloudWatch failure fallback. These tests use a mocked AWS transport and do not contact AWS. Type-check with `npx tsc --noEmit --incremental false`.

Live CloudWatch delivery requires your configured credentials and a production invocation; it has not been verified here. A production build/server was not launched, keeping `.env` loading out of this verification.
