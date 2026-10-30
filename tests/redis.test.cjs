const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { randomUUID } = require("node:crypto");

function moduleLoader(mocks = {}) {
  const modules = new Map();
  function load(file) {
    const full = path.resolve(__dirname, "..", file);
    if (modules.has(full)) return modules.get(full);
    const exports = {};
    modules.set(full, exports);
    const code = ts.transpileModule(fs.readFileSync(full, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText;
    new Function("require", "exports", code)((id) => {
      if (id in mocks) return mocks[id];
      if (id === "server-only") return {};
      if (id === "@/lib/logging/logger")
        return {
          createLogger: () => ({ warning() {}, diagnostic() {}, error() {} }),
        };
      if (id.startsWith("@/")) return load(id.slice(2) + ".ts");
      if (id.startsWith("."))
        return load(
          path.relative(
            path.resolve(__dirname, ".."),
            path.resolve(path.dirname(full), id + ".ts"),
          ),
        );
      return require(id);
    }, exports);
    return exports;
  }
  return load;
}

const load = moduleLoader();
const redisModule = load("lib/redis.ts");
const rate = load("lib/rateLimit.ts");
const cache = load("lib/redisCache.ts");
const { RATE_LIMITS } = load("lib/constants.ts");

test("missing Redis configuration fails closed without exposing connection details", async () => {
  const previous = process.env.REDIS_URL;
  delete process.env.REDIS_URL;
  try {
    await assert.rejects(
      rate.enforceRateLimit("missing", "identity", {
        limit: 1,
        windowMs: 1000,
      }),
      redisModule.RedisUnavailableError,
    );
    const response = rate.rateLimitResponse(
      new redisModule.RedisUnavailableError(),
    );
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("retry-after"), "5");
  } finally {
    if (previous === undefined) delete process.env.REDIS_URL;
    else process.env.REDIS_URL = previous;
  }
});

test("only the explicitly trusted, valid IP header can select a client bucket", () => {
  delete process.env.RATE_LIMIT_IP_HEADER;
  const headers = new Headers({
    "x-forwarded-for": "1.2.3.4",
    "x-real-ip": "5.6.7.8",
  });
  assert.equal(rate.clientIp(headers), "unknown");
  process.env.RATE_LIMIT_IP_HEADER = "x-real-ip";
  assert.equal(rate.clientIp(headers), "5.6.7.8");
  assert.equal(
    rate.clientIp(new Headers({ "x-real-ip": "attacker-controlled" })),
    "unknown",
  );
});

// Never fall back to REDIS_URL: integration tests must not mutate a configured production DB.
test(
  "Redis TCP integration",
  { skip: !process.env.REDIS_TEST_URL },
  async (t) => {
    process.env.REDIS_URL = process.env.REDIS_TEST_URL;
    process.env.REDIS_KEY_PREFIX = `rh-tests:${randomUUID()}`;
    process.env.RATE_LIMIT_IP_HEADER = "x-test-ip";
    const redis = await redisModule.getRedis();
    after(async () => {
      const keys = await redis.keys(process.env.REDIS_KEY_PREFIX + ":*");
      if (keys.length) await redis.del(...keys);
      redis.disconnect();
    });

    await t.test(
      "the shared client reconnects after a closed TCP connection",
      async () => {
        const closed = new Promise((resolve) => redis.once("end", resolve));
        redis.disconnect();
        await closed;
        assert.equal(await (await redisModule.getRedis()).ping(), "PONG");
      },
    );

    await t.test(
      "concurrent callers cannot exceed the rolling allowance; slots expire",
      async () => {
        const policy = { limit: 3, windowMs: 200 };
        const results = await Promise.allSettled(
          Array.from({ length: 25 }, () =>
            rate.enforceRateLimit("concurrent", "member", policy),
          ),
        );
        assert.equal(results.filter((r) => r.status === "fulfilled").length, 3);
        for (const result of results.filter((r) => r.status === "rejected")) {
          assert.ok(result.reason instanceof rate.RateLimitError);
          assert.ok(result.reason.retryAfter >= 1);
        }
        assert.ok(
          (await redis.pttl(rate.rateLimitKey("concurrent", "member"))) > 0,
        );
        await new Promise((resolve) => setTimeout(resolve, 230));
        await rate.enforceRateLimit("concurrent", "member", policy);
      },
    );

    await t.test(
      "web actions and mobile requests share normalized account limits",
      async () => {
        const headers = new Headers({ "x-test-ip": "127.0.0.2" });
        const web = moduleLoader({
          "next/headers": { headers: async () => headers },
        })("lib/authRateLimit.ts");
        for (let i = 0; i < RATE_LIMITS.login.limit / 2; i++)
          await web.enforceAuthActionRateLimit("login", " Shared@Example.COM ");
        for (let i = 0; i < RATE_LIMITS.login.limit / 2; i++)
          await rate.enforceAuthRateLimit(
            "login",
            "shared@example.com",
            headers,
          );
        await assert.rejects(
          rate.enforceAuthRateLimit("login", "SHARED@example.com", headers),
          rate.RateLimitError,
        );
        await rate.enforceAuthRateLimit(
          "login",
          "another@example.com",
          headers,
        );
        assert.doesNotMatch(
          rate.rateLimitKey("auth:login:account", "shared@example.com"),
          /shared|example/,
        );
      },
    );

    await t.test(
      "membership send limits span workshops and failure counters expire",
      async () => {
        const otp = load("lib/workshopMemberRateLimit.ts");
        await Promise.all(
          Array.from({ length: RATE_LIMITS.workshopMember.send.limit }, () =>
            otp.enforceWorkshopMemberSendLimit("same-card"),
          ),
        );
        await assert.rejects(
          otp.enforceWorkshopMemberSendLimit("same-card"),
          rate.RateLimitError,
        );
        const challenge = randomUUID();
        await otp.initializeWorkshopOtpAttempts(challenge, 5000);
        await Promise.all(
          Array.from({ length: 5 }, () =>
            otp.recordWorkshopOtpFailure(challenge, 5000),
          ),
        );
        assert.equal(await otp.getWorkshopOtpAttempts(challenge), 5);
        const key = rate.rateLimitKey("workshop-member-incorrect", challenge);
        assert.ok((await redis.pttl(key)) > 0);
        assert.ok((await redis.pttl(key)) <= 5000);
        await redis.pexpire(key, 1);
        await new Promise((resolve) => setTimeout(resolve, 10));
        await assert.rejects(
          otp.getWorkshopOtpAttempts(challenge),
          redisModule.RedisUnavailableError,
        );
        await assert.rejects(
          otp.recordWorkshopOtpFailure(challenge, 5000),
          redisModule.RedisUnavailableError,
        );
      },
    );

    await t.test(
      "cache hits preserve dates; invalidation hides fills from before a write",
      async () => {
        let reads = 0;
        const get = () =>
          cache.cachedRedis("courses", "catalog", 60, async () => ({
            at: new Date("2026-01-01"),
            revision: ++reads,
          }));
        assert.equal((await get()).revision, 1);
        const hit = await get();
        assert.equal(hit.revision, 1);
        assert.ok(hit.at instanceof Date);
        await cache.invalidateRedisCache("courses");
        assert.equal((await get()).revision, 2);

        let resolveStarted, resolveLoad;
        const started = new Promise((resolve) => {
          resolveStarted = resolve;
        });
        const delayed = cache.cachedRedis("courses", "race", 60, () => {
          resolveStarted();
          return new Promise((resolve) => {
            resolveLoad = resolve;
          });
        });
        await started;
        await cache.invalidateRedisCache("courses");
        resolveLoad("old");
        assert.equal(await delayed, "old");
        assert.equal(
          await cache.cachedRedis("courses", "race", 60, async () => "new"),
          "new",
        );
      },
    );

    await t.test(
      "failed database reads are not cached, and cache outages fall back",
      async () => {
        await assert.rejects(
          cache.cachedRedis("courses", "failure", 60, async () => {
            throw new Error("DB failed");
          }),
          /DB failed/,
        );

        assert.equal(
          await cache.cachedRedis(
            "courses",
            "failure",
            60,
            async () => "recovered",
          ),
          "recovered",
        );
        const previous = process.env.REDIS_URL;
        delete process.env.REDIS_URL;
        try {
          assert.equal(
            await cache.cachedRedis(
              "courses",
              "outage",
              60,
              async () => "database",
            ),
            "database",
          );
        } finally {
          process.env.REDIS_URL = previous;
        }
      },
    );

    await t.test(
      "admin lesson edits invalidate public catalogue data after commit",
      async () => {
        await cache.cachedRedis(
          "courses",
          "lesson-edit",
          60,
          async () => "old",
        );
        const events = [];
        const actions = moduleLoader({
          "@/db": { courseItem: { id: "id" } },
          "@/lib/dbConfig": {
            db: {
              update: () => ({
                set: () => ({
                  where: async () => {
                    events.push("database-write");
                  },
                }),
              }),
            },
          },
          "drizzle-orm": { eq: () => ({}) },
          "@/lib/adminAuth": {
            requireAdmin: async () => {
              events.push("authorize");
            },
          },
          "@/lib/publicAsset": { courseAssetKey: (value) => value },
          "@/lib/logging/operations": {
            runLoggedOperation: (_category, _source, fn) => fn(),
          },
          "next/cache": { revalidatePath: (value) => events.push(value) },
        })("actions/courseAdminActions.ts");
        await actions.updateCourseItem("item", {
          courseId: "course",
          mediaUrl: "course/video.mp4",
          mediaType: "video",
          priority: 0,
        });
        assert.equal(
          await cache.cachedRedis(
            "courses",
            "lesson-edit",
            60,
            async () => "new",
          ),
          "new",
        );
        assert.deepEqual(events.slice(0, 2), ["authorize", "database-write"]);
        assert.ok(events.includes("/courses/[slug]"));
        assert.ok(events.includes("/"));
      },
    );

    await t.test(
      "admin authorization runs before every cache hit",
      async () => {
        let authorized = true,
          checks = 0,
          queries = 0;
        const dashboard = moduleLoader({
          "@/lib/adminAuth": {
            requireAdmin: async () => {
              checks++;
              if (!authorized) throw new Error("Forbidden");
            },
          },
          "@/lib/dbConfig": {
            db: {
              select: () => {
                queries++;
                return {
                  from: () => ({
                    where: async () => [{ count: 1, total: 10 }],
                  }),
                };
              },
            },
          },
          "@/db/index": {
            user: {},
            workshopRegistration: {},
            seminarRegistrations: {},
            workshop: {},
          },
          "drizzle-orm": {
            sql: () => "sql",
            eq() {},
            desc() {},
            and() {},
            gte() {},
            lte() {},
            inArray() {},
          },
          "@/lib/logging/operations": {
            runLoggedOperation: (_category, _source, fn) => fn(),
          },
          "@/lib/logging/logger": {
            createLogger: () => ({ error() {}, warning() {}, diagnostic() {} }),
          },
        })("actions/dashboardActions.ts");
        assert.equal((await dashboard.getTodayStats()).newUsers, 1);
        assert.equal((await dashboard.getTodayStats()).newUsers, 1);
        assert.equal(queries, 5);
        authorized = false;
        assert.equal((await dashboard.getTodayStats()).newUsers, 0);
        assert.equal(checks, 3);
        assert.equal(queries, 5);
      },
    );

    await t.test(
      "public API wrapper blocks before handler, emits Retry-After, and leaves callbacks available",
      async () => {
        const noop = () => {};
        const { withApiLogging } = moduleLoader({
          "./context": {
            createLogContext: () => ({ requestId: randomUUID() }),
            logContext: { run: (_c, fn) => fn() },
            rememberErrorContext: noop,
            hasReportedError: () => false,
          },
          "./logger": {
            createLogger: () => ({ diagnostic: noop, summary: noop }),
          },
          "./policy": { diagnosticsEnabled: () => false },
          "./shared": { statusLevel: () => "info" },
        })("lib/logging/api.ts");
        let calls = 0;
        const handler = withApiLogging("/app/api/contact-form", async () => {
          calls++;
          return new Response("ok");
        });
        const request = () =>
          new Request("http://localhost/api/contact-form", {
            method: "POST",
            headers: { "x-test-ip": "127.0.0.4" },
          });
        for (let i = 0; i < RATE_LIMITS.contact.limit; i++)
          assert.equal((await handler(request())).status, 200);
        const blocked = await handler(request());
        assert.equal(blocked.status, 429);
        assert.ok(Number(blocked.headers.get("retry-after")) > 0);
        assert.equal(calls, RATE_LIMITS.contact.limit);
        delete process.env.REDIS_URL;
        try {
          assert.equal((await handler(request())).status, 503);
          assert.equal(calls, RATE_LIMITS.contact.limit);
          const webhook = withApiLogging(
            "/app/api/verify-payment",
            async () => new Response("ok"),
          );
          assert.equal(
            (
              await webhook(
                new Request("http://localhost/api/verify-payment", {
                  method: "POST",
                }),
              )
            ).status,
            200,
          );
        } finally {
          process.env.REDIS_URL = process.env.REDIS_TEST_URL;
        }
      },
    );
  },
);
