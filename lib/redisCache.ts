import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { getRedis, redisKey } from "@/lib/redis";
import { createLogger } from "@/lib/logging/logger";

export type CacheNamespace =
  "courses" | "workshops" | "reviews" | "admin-stats";
const logger = createLogger("integration", "lib/redisCache.ts");
let nextWarningAt = 0;
const pending = new Map<string, Promise<unknown>>();

function reportCacheFailure() {
  if (Date.now() < nextWarningAt) return;
  nextWarningAt = Date.now() + 60_000;
  logger.warning(
    "Redis cache operation failed; using database fallback and bounded cache expiry",
  );
}

// Explicit date tagging preserves the Drizzle result types on cache hits.
function encode(value: unknown): unknown {
  if (value instanceof Date) return { $rhDate: value.toISOString() };
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, encode(item)]),
    );
  return value;
}
function decode(_key: string, value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "$rhDate" in value &&
    Object.keys(value).length === 1
  )
    return new Date(String(value.$rhDate));
  return value;
}

export async function cachedRedis<T>(
  namespace: CacheNamespace,
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
): Promise<T> {
  let cacheKey: string | undefined;
  try {
    const redis = await getRedis();
    const generation =
      (await redis.get(redisKey(`cache-generation:${namespace}`))) || "initial";
    const digest = createHash("sha256").update(key).digest("hex");
    cacheKey = redisKey(`cache:v1:${namespace}:${generation}:${digest}`);
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      logger.diagnostic("Redis cache hit", { namespace });
      return JSON.parse(cached, decode) as T;
    }
    logger.diagnostic("Redis cache miss", { namespace });
  } catch {
    // Cache availability never controls access to the underlying database.
    reportCacheFailure();
  }
  if (cacheKey && pending.has(cacheKey))
    return pending.get(cacheKey) as Promise<T>;
  const operation = (async () => {
    const value = await load();
    if (cacheKey) {
      try {
        const redis = await getRedis();
        await redis.set(
          cacheKey,
          JSON.stringify(encode(value)),
          "EX",
          ttlSeconds,
        );
      } catch {
        reportCacheFailure();
      }
    }
    return value;
  })();
  if (cacheKey) pending.set(cacheKey, operation);
  try {
    return await operation;
  } finally {
    if (cacheKey) pending.delete(cacheKey);
  }
}

export async function invalidateRedisCache(namespace: CacheNamespace) {
  try {
    const redis = await getRedis();
    // A generation switch also hides fills that started before the committed write.
    // Old values expire naturally, without SCAN/KEYS or a growing tag-membership set.
    await redis.set(redisKey(`cache-generation:${namespace}`), randomUUID());
  } catch {
    reportCacheFailure();
  }
}
