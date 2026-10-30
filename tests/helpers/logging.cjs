// Business-logic suites isolate logging. logging.test.cjs exercises the real logger/transport.
const logger = { diagnostic() {}, info() {}, warning() {}, error() {} };
// Existing business suites isolate Redis; redis.test.cjs exercises its real helpers/scripts.
class RateLimitError extends Error { constructor(retryAfter) { super("Rate limited"); this.retryAfter = retryAfter; } }
class RedisUnavailableError extends Error {}
module.exports = {
  "@/lib/redisCache": { cachedRedis: (_namespace, _key, _ttl, load) => load(), invalidateRedisCache: async () => {} },
  "@/lib/rateLimit": { enforceAuthRateLimit: async () => {}, checkPublicApiRateLimit: async () => {}, rateLimitResponse: () => null, RateLimitError },
  "@/lib/authRateLimit": { enforceAuthActionRateLimit: async () => {} },
  "@/lib/redis": { RedisUnavailableError },
  "@/lib/logging/logger": {
    createLogger: () => logger,
    flushLogs: async () => {},
  },
  "@/lib/logging/client": { createClientLogger: () => logger },
  "@/lib/logging/api": { withApiLogging: (_route, handler) => handler },
  "@/lib/logging/operations": {
    runLoggedOperation: (_category, _source, operation) => operation(),
  },
  "@/lib/logging/aws": { instrumentAwsClient() {} },
};
