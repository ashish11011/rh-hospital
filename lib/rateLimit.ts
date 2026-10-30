import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { RATE_LIMITS } from "@/lib/constants";
import { getRedis, redisKey, RedisUnavailableError } from "@/lib/redis";

export type RateLimitPolicy = { limit: number; windowMs: number };
export type AuthRateLimitAction =
  | "login"
  | "signup"
  | "forgotPassword"
  | "resendCode"
  | "confirmEmail"
  | "resetPassword";

export class RateLimitError extends Error {
  constructor(public retryAfter: number) {
    super(`Too many requests. Please try again in ${retryAfter} seconds.`);
    this.name = "RateLimitError";
  }
}

// Redis time and one atomic script keep the rolling window consistent across processes.
export const SLIDING_WINDOW_SCRIPT = `
local time = redis.call('TIME')
local now = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)
local window = tonumber(ARGV[1])
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - window)
if redis.call('ZCARD', KEYS[1]) >= tonumber(ARGV[2]) then
  local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
  return math.max(1, math.ceil((tonumber(oldest[2]) + window - now) / 1000))
end
redis.call('ZADD', KEYS[1], now, ARGV[3])
redis.call('PEXPIRE', KEYS[1], window)
return 0
`;

export function rateLimitKey(scope: string, identity: string) {
  return redisKey(
    `rate:${scope}:${createHash("sha256").update(identity).digest("hex")}`,
  );
}

export async function enforceRateLimit(
  scope: string,
  identity: string,
  policy: RateLimitPolicy,
) {
  let retryAfter: number;
  try {
    const redis = await getRedis();
    retryAfter = Number(
      await redis.eval(
        SLIDING_WINDOW_SCRIPT,
        1,
        rateLimitKey(scope, identity),
        policy.windowMs,
        policy.limit,
        randomUUID(),
      ),
    );
    if (!Number.isFinite(retryAfter)) throw new Error();
  } catch {
    throw new RedisUnavailableError();
  }
  if (retryAfter > 0) throw new RateLimitError(retryAfter);
}

// Only trust this header when the deployment proxy overwrites it (see docs/redis.md).
// Missing/untrusted IPs share a conservative bucket; clients cannot choose the key.
export function clientIp(headers: Pick<Headers, "get">) {
  const header = process.env.RATE_LIMIT_IP_HEADER;
  if (!header) return "unknown";
  const value = headers.get(header)?.split(",")[0]?.trim() || "";
  return isIP(value) ? value : "unknown";
}

export async function enforceAuthRateLimit(
  action: AuthRateLimitAction,
  email: string,
  headers: Pick<Headers, "get">,
) {
  const policy = RATE_LIMITS[action];
  await enforceRateLimit(`auth:${action}:ip`, clientIp(headers), {
    ...policy,
    limit: policy.ipLimit,
  });
  await enforceRateLimit(
    `auth:${action}:account`,
    email.trim().toLowerCase(),
    policy,
  );
}

export function rateLimitResponse(error: unknown): Response | null {
  const unavailable = error instanceof RedisUnavailableError;
  if (!(error instanceof RateLimitError) && !unavailable) return null;
  const retryAfter = error instanceof RateLimitError ? error.retryAfter : 5;
  return Response.json(
    {
      error: (error as Error).message,
      message: (error as Error).message,
      code: unavailable ? "SERVICE_UNAVAILABLE" : "RATE_LIMITED",
      retryAfter,
    },
    {
      status: unavailable ? 503 : 429,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function checkPublicApiRateLimit(route: string, request: Request) {
  const path = route.replace(/^\/app/, "");
  // Provider callbacks must reach their own authenticated, durable processing flow.
  if (
    path.startsWith("/api/admin") ||
    path.startsWith("/api/webhooks/") ||
    [
      "/api/verify-payment",
      "/api/payment-success",
      "/api/apple/notifications",
    ].includes(path) ||
    !path.startsWith("/api/") ||
    request.method === "OPTIONS"
  )
    return;
  // Authentication requests have shared account + IP limits at their service boundary.
  if (
    /^\/api\/auth\/mobile\/(login|signup|confirm|resend-code|forgot-password|reset-password)$/.test(
      path,
    )
  )
    return;
  // Private mobile/dashboard APIs authenticate independently; do not pool server-side
  // dashboard fetches into the anonymous public API bucket.
  if (
    path.startsWith("/api/auth/mobile/") &&
    path !== "/api/auth/mobile/refresh"
  )
    return;
  const policy =
    path === "/api/logs"
      ? RATE_LIMITS.browserLogs
      : path === "/api/contact-form"
        ? RATE_LIMITS.contact
        : path === "/api/auth/mobile/refresh"
          ? RATE_LIMITS.refresh
          : request.method === "GET" || path.endsWith("/progress")
            ? RATE_LIMITS.publicRead
            : RATE_LIMITS.publicWrite;
  // Route templates keep attacker-selected IDs out of bucket names.
  await enforceRateLimit(
    `api:${request.method}:${path}`,
    clientIp(request.headers),
    policy,
  );
}
