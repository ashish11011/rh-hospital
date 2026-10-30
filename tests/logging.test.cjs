const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { AsyncLocalStorage } = require("node:async_hooks");
const crypto = require("node:crypto");

function harness(environment = "development", options = {}) {
  const output = [],
    after = [],
    commands = [],
    cache = new Map();
  const env = {
    NODE_ENV: environment,
    CLOUDWATCH_AWS_REGION: "ap-south-1",
    CLOUDWATCH_LOG_GROUP_NAME: "/test/rh",
    CLOUDWATCH_AWS_ACCESS_KEY_ID: "fake-access",
    CLOUDWATCH_AWS_SECRET_ACCESS_KEY: "fake-secret",
    ...options.env,
  };
  const store = new AsyncLocalStorage();
  let headerReads = 0;
  const mocks = {
    "@/lib/rateLimit": { checkPublicApiRateLimit: async () => {}, rateLimitResponse: () => null },
    "server-only": {},
    "node:async_hooks": { AsyncLocalStorage },
    "node:crypto": crypto,
    react: { cache: (fn) => fn },
    "next/headers": {
      headers: async () => {
        headerReads++;
        return options.headers || new Headers();
      },
    },
    "next/server": {
      NextResponse: { json: (body, init) => Response.json(body, init) },
      after: (fn) => {
        after.push(fn);
      },
    },
    "@aws-sdk/client-cloudwatch-logs": {
      CloudWatchLogsClient: class {
        async send(command) {
          commands.push(command);
          if (options.fail)
            throw new Error("fake transport failure containing fake-secret");
          return {};
        }
      },
      ...Object.fromEntries(
        [
          "CreateLogGroupCommand",
          "CreateLogStreamCommand",
          "PutLogEventsCommand",
        ].map((name) => [
          name,
          class {
            constructor(input) {
              this.kind = name;
              this.input = input;
            }
          },
        ]),
      ),
    },
    ...options.modules,
  };
  function load(file) {
    const absolute = path.resolve(file);
    if (cache.has(absolute)) return cache.get(absolute);
    const exports = {};
    cache.set(absolute, exports);
    const compiled = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText;
    vm.runInNewContext(
      compiled,
      {
        exports,
        Error,
        Date,
        WeakSet,
        Buffer,
        Headers,
        Request,
        Response,
        Uint8Array,
        URL,
        performance,
        crypto,
        process: { env },
        fetch: options.fetch || fetch,
        console: { log: (value) => output.push(JSON.parse(value)) },
        require: (id) => {
          if (id in mocks) return mocks[id];
          if (id.startsWith("@/")) return load(id.slice(2) + ".ts");
          if (id.startsWith("."))
            return load(path.resolve(path.dirname(absolute), id) + ".ts");
          throw new Error(`Unexpected module: ${id}`);
        },
      },
      { filename: file },
    );
    return exports;
  }
  return {
    load,
    output,
    after,
    commands,
    env,
    store,
    headerReads: () => headerReads,
    drain: async () => {
      for (const callback of after.splice(0)) await callback();
    },
  };
}

function storedEvents(h) {
  return h.commands
    .filter((command) => command.kind === "PutLogEventsCommand")
    .flatMap((command) =>
      Array.from(command.input.logEvents, (event) => JSON.parse(event.message)),
    );
}

test("HDFC request start logs the top-level webhook event ID in production without duplicating starts or logging the payload", async () => {
  const eventId = "evt_V2_bdb4748140b34a278df540577ccf6e83";
  for (const diagnostics of [false, true]) {
    const calls = [];
    const h = harness("production", {
      env: {
        HDFC_SMARTGATEWAY_AUTHORIZATION: "test-authorization",
        LOG_DIAGNOSTICS: String(diagnostics),
      },
      modules: {
        "@/lib/paymentConfirmation": {
          normalizeHdfcWebhookEvent: () => "completed",
          updatePaymentFromGatewayStatus: async (input) => {
            calls.push(input);
          },
        },
      },
    });
    const { POST } = h.load("app/api/verify-payment/route.ts");
    const response = await POST(
      new Request("https://example.com/api/verify-payment", {
        method: "POST",
        headers: {
          authorization: "test-authorization",
          "x-vercel-id": "bom1::hdfc-webhook",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          id: eventId,
          event_name: "ORDER_SUCCEEDED",
          privateField: "private-body-value",
          content: {
            order: {
              order_id: "order-1",
              txn_id: "transaction-1",
              id: "different-order-id",
              status: "CHARGED",
            },
          },
        }),
      }),
    );
    assert.equal(response.status, 200);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].gatewayPaymentId, "transaction-1");
    await h.drain();
    const events = storedEvents(h);
    const starts = events.filter(
      (event) => event.message === "Request started",
    );
    assert.equal(starts.length, 1);
    assert.equal(starts[0].level, "info");
    assert.equal(starts[0].metadata.hdfcWebhookId, eventId);
    assert.ok(
      events.every((event) => event.requestId === "bom1::hdfc-webhook"),
    );
    assert.ok(!JSON.stringify(events).includes("private-body-value"));
    assert.ok(!JSON.stringify(events).includes("test-authorization"));
    assert.ok(!JSON.stringify(events).includes("different-order-id"));
  }
});

test("unauthorized HDFC requests do not parse or log an untrusted webhook event ID", async () => {
  const h = harness("production", {
    env: { HDFC_SMARTGATEWAY_AUTHORIZATION: "expected-authorization" },
    modules: { "@/lib/paymentConfirmation": {} },
  });
  const { POST } = h.load("app/api/verify-payment/route.ts");
  const response = await POST(
    new Request("https://example.com/api/verify-payment", {
      method: "POST",
      headers: { authorization: "wrong-authorization" },
      body: JSON.stringify({ id: "untrusted-event-id" }),
    }),
  );
  assert.equal(response.status, 401);
  await h.drain();
  const events = storedEvents(h);
  assert.equal(events.length, 1);
  assert.equal(events[0].metadata.status, 401);
  assert.ok(!JSON.stringify(events).includes("untrusted-event-id"));
});

test("production reduces a successful request with nested services, four queries and an SDK call to one summary", async () => {
  for (const diagnostics of [false, true]) {
    const h = harness("production", {
      env: diagnostics ? { LOG_DIAGNOSTICS: "true" } : {},
    });
    const { withApiLogging } = h.load("lib/logging/api.ts");
    const { runLoggedOperation } = h.load("lib/logging/operations.ts");
    const { databaseLogger } = h.load("lib/logging/resource.ts");
    let middleware;
    h.load("lib/logging/aws.ts").instrumentAwsClient(
      {
        middlewareStack: {
          add(fn) {
            middleware = fn;
          },
        },
      },
      "provider",
    );
    const work = () =>
      runLoggedOperation("service", "first", () =>
        runLoggedOperation("service", "second", () =>
          runLoggedOperation("service", "third", async () => {
            for (let index = 0; index < 4; index++)
              databaseLogger.logQuery("select private_data from users", [
                "private",
              ]);
            await middleware(async () => ({ output: {} }), {
              commandName: "SendMessageCommand",
            })({ input: {} });
            return new Response("ok");
          }),
        ),
      );
    const response = await withApiLogging(
      "/api/production-profile",
      work,
    )(
      new Request("https://example.com", {
        headers: { "x-vercel-id": "bom1::volume" },
      }),
    );
    assert.equal(await response.text(), "ok");
    await h.drain();
    const events = storedEvents(h);
    assert.equal(events.length, diagnostics ? 14 : 1);
    assert.ok(events.every((event) => event.requestId === "bom1::volume"));
    assert.ok(
      events.some(
        (event) =>
          event.category === "api" && event.message === "Request completed",
      ),
    );
    assert.ok(!JSON.stringify(events).includes("private"));
  }
});

test("production keeps business milestones, root failure detail and the API summary without repeating the exception in each helper", async () => {
  const h = harness("production");
  const { withApiLogging } = h.load("lib/logging/api.ts");
  const { runLoggedOperation } = h.load("lib/logging/operations.ts");
  const logger = h
    .load("lib/logging/logger.ts")
    .createLogger("service", "payment");
  const failure = new Error("provider failed");
  const handler = withApiLogging("/api/payment", async () => {
    logger.info("Payment confirmed", { paymentId: "payment-1" });
    try {
      await runLoggedOperation("service", "outer", () =>
        runLoggedOperation("service", "inner", () =>
          runLoggedOperation("integration", "provider", async () => {
            throw failure;
          }),
        ),
      );
    } catch (error) {
      logger.error("Payment failed", { details: [error] });
    }
    return new Response(null, { status: 500 });
  });
  await handler(new Request("https://example.com"));
  await h.drain();
  const events = storedEvents(h);
  assert.equal(events.length, 3);
  assert.equal(
    events.filter((event) => event.message === "Operation failed").length,
    1,
  );
  assert.ok(events.some((event) => event.message === "Payment confirmed"));
  assert.ok(
    events.some(
      (event) => event.category === "api" && event.metadata.status === 500,
    ),
  );
});

test("an unhandled exception produces a root error and request summary without a third copy from Next instrumentation", async () => {
  const h = harness("production");
  const { withApiLogging } = h.load("lib/logging/api.ts");
  const { runLoggedOperation } = h.load("lib/logging/operations.ts");
  const failure = new Error("failed");
  await assert.rejects(
    withApiLogging("/api/test", async () =>
      runLoggedOperation("service", "helper", async () => {
        throw failure;
      }),
    )(new Request("https://example.com")),
    (error) => error === failure,
  );
  await h
    .load("instrumentation.ts")
    .onRequestError(
      failure,
      { method: "GET", headers: {} },
      { routeType: "route", routePath: "/api/test" },
    );
  const events = storedEvents(h);
  assert.equal(events.length, 2);
  assert.equal(events.filter((event) => event.metadata.error).length, 1);
  assert.equal(new Set(events.map((event) => event.requestId)).size, 1);
});

test("independent failures in concurrent operations and different requests are retained", async () => {
  const h = harness("production");
  const { withApiLogging } = h.load("lib/logging/api.ts");
  const { runLoggedOperation } = h.load("lib/logging/operations.ts");
  const handler = withApiLogging("/api/test", async () => {
    await Promise.all(
      ["one", "two"].map((source) =>
        runLoggedOperation("service", source, async () => {
          await Promise.resolve();
          return { error: "rejected" };
        }),
      ),
    );
    return new Response(null, { status: 400 });
  });
  await Promise.all(
    ["bom1::one", "bom1::two"].map((id) =>
      handler(
        new Request("https://example.com", { headers: { "x-vercel-id": id } }),
      ),
    ),
  );
  await h.drain();
  const events = storedEvents(h);
  for (const id of ["bom1::one", "bom1::two"]) {
    const requestEvents = events.filter((event) => event.requestId === id);
    assert.equal(requestEvents.length, 3);
    assert.ok(requestEvents.some((event) => event.source === "one"));
    assert.ok(requestEvents.some((event) => event.source === "two"));
  }
});

test("production browser info and successful telemetry/proxy summaries do not create extra records", async () => {
  const submitted = [];
  const h = harness("production", {
    fetch: async (...args) => {
      submitted.push(args);
      return new Response(null, { status: 204 });
    },
  });
  const { browserEvents } = h.load("lib/logging/browser-events.ts");
  const [source, messages] = Object.entries(browserEvents)[0];
  h.load("lib/logging/client.ts")
    .createClientLogger("service", source)
    .info(messages[0]);
  assert.equal(submitted.length, 0);
  const { POST } = h.load("app/api/logs/route.ts");
  const response = await POST(
    new Request("https://example.com/api/logs", {
      method: "POST",
      headers: {
        origin: "https://example.com",
        "content-type": "application/json",
      },
      body: JSON.stringify({ source, message: messages[0], level: "error" }),
    }),
  );
  assert.equal(response.status, 204);
  await h.drain();
  assert.equal(storedEvents(h).length, 1);
  const before = h.commands.length;
  const { withApiLogging } = h.load("lib/logging/api.ts");
  await withApiLogging("/admin/:path*", async () => new Response(null), {
    logSuccess: false,
  })(new Request("https://example.com"));
  await h.drain();
  assert.equal(h.commands.length, before);
});

test("development UUID overrides incoming header; all levels use console.log", async () => {
  const h = harness();
  const { withApiLogging } = h.load("lib/logging/api.ts");
  const { createLogger } = h.load("lib/logging/logger.ts");
  const response = await withApiLogging("/api/test", async () => {
    const log = createLogger("service", "test");
    log.info("Started");
    log.warning("Expected rejection");
    log.error("Failure");
    return new Response("ok");
  })(
    new Request("https://example.com/test?secret=hidden", {
      headers: { "x-vercel-id": "ignored" },
    }),
  );
  const ids = new Set(h.output.map((e) => e.requestId));
  assert.equal(ids.size, 1);
  assert.match([...ids][0], /^[a-f0-9-]{36}$/);
  assert.equal(response.headers.get("x-request-id"), [...ids][0]);
  assert.deepEqual(
    h.output.slice(1, 4).map((e) => e.level),
    ["info", "warning", "error"],
  );
  assert.equal(h.commands.length, 0);
});

test("production isolates overlapping requests and puts categories/severities in separate CloudWatch streams", async () => {
  const h = harness("production");
  const { withApiLogging } = h.load("lib/logging/api.ts");
  const { createLogger } = h.load("lib/logging/logger.ts");
  const handler = withApiLogging("/api/test", async (request) => {
    await Promise.resolve();
    createLogger("resources", "db").info("Query dispatched");
    createLogger("integration", "provider").warning("Provider rejected");
    return new Response(null, {
      status:
        request.headers.get("x-vercel-id") === "region::first" ? 400 : 503,
    });
  });
  await Promise.all(
    ["region::first", "region::second"].map((id) =>
      handler(
        new Request("https://example.com", { headers: { "x-vercel-id": id } }),
      ),
    ),
  );
  assert.equal(h.output.length, 0);
  await h.drain();
  const puts = h.commands.filter((c) => c.kind === "PutLogEventsCommand");
  assert.ok(
    puts.some((c) => c.input.logStreamName.includes("/resources/info/")),
  );
  assert.ok(puts.some((c) => c.input.logStreamName.includes("/api/warning/")));
  assert.ok(puts.some((c) => c.input.logStreamName.includes("/api/error/")));
  const events = puts.flatMap((c) =>
    c.input.logEvents.map((e) => JSON.parse(e.message)),
  );
  for (const id of ["region::first", "region::second"])
    assert.equal(events.filter((e) => e.requestId === id).length, 3);
});

test("missing production request header falls back to a UUID and reports its source", () => {
  const { createLogContext } = harness("production").load(
    "lib/logging/context.ts",
  );
  const context = createLogContext(new Headers());
  assert.equal(context.requestIdSource, "uuid");
  assert.match(context.requestId, /^[a-f0-9-]{36}$/);
});

test("redacts nested credentials, personal data, payloads, raw error messages and circular structures", () => {
  const h = harness();
  const log = h
    .load("lib/logging/logger.ts")
    .createLogger("integration", "test");
  const object = {
    authorization: "secret1",
    nested: { password: "secret2", email: "member@example.com" },
    body: "secret3",
    error: new Error("SQL private data secret4"),
  };
  object.circular = object;
  log.error("Provider failed", object);
  const serialized = JSON.stringify(h.output);
  for (const secret of [
    "secret1",
    "secret2",
    "secret3",
    "secret4",
    "member@example.com",
    "SQL private",
  ])
    assert.ok(!serialized.includes(secret));
  assert.ok(serialized.includes("[REDACTED]"));
  assert.ok(serialized.includes("[CIRCULAR]"));
});

test("transport failure falls back to sanitized console records without rejecting business work", async () => {
  const h = harness("production", { fail: true });
  const { withApiLogging } = h.load("lib/logging/api.ts");
  const response = await withApiLogging(
    "/test",
    async () => new Response("saved"),
  )(new Request("https://example.com"));
  assert.equal(await response.text(), "saved");
  await h.drain();
  assert.ok(
    h.output.some((e) => e.message.includes("CloudWatch delivery failed")),
  );
  assert.ok(!JSON.stringify(h.output).includes("fake-secret"));
});

test("route wrapper preserves streaming body/cookies and rethrows identical errors and redirects", async () => {
  const h = harness();
  const { withApiLogging } = h.load("lib/logging/api.ts");
  const original = new Response("stream body", {
    headers: { "set-cookie": "session=opaque; HttpOnly" },
  });
  assert.equal(
    await withApiLogging(
      "/test",
      async () => original,
    )(new Request("https://example.com")),
    original,
  );
  assert.equal(original.headers.get("set-cookie"), "session=opaque; HttpOnly");
  const redirect = Object.assign(new Error("redirect"), {
    digest: "NEXT_REDIRECT;replace;/login;307;",
  });
  await assert.rejects(
    withApiLogging("/test", async () => {
      throw redirect;
    })(new Request("https://example.com")),
    (error) => error === redirect,
  );
  assert.equal(h.output.at(-1).level, "info");
  const failure = new Error("boom");
  await assert.rejects(
    withApiLogging("/test", async () => {
      throw failure;
    })(new Request("https://example.com")),
    (error) => error === failure,
  );
  assert.equal(h.output.at(-1).level, "error");
});

test("service logging uses request headers, warns on returned failures and propagates control flow", async () => {
  const h = harness();
  const { runLoggedOperation } = h.load("lib/logging/operations.ts");
  const result = await runLoggedOperation("service", "action", async () => ({
    error: "Invalid input",
  }));
  assert.equal(result.error, "Invalid input");
  assert.equal(h.output.at(-1).level, "warning");
  const reads = h.headerReads();
  await runLoggedOperation("resources", "cached", async () => 42, false);
  assert.equal(h.headerReads(), reads);
  const redirect = Object.assign(new Error("redirect"), {
    digest: "NEXT_REDIRECT;replace;/login;307;",
  });
  await assert.rejects(
    runLoggedOperation("service", "action", async () => {
      throw redirect;
    }),
    (error) => error === redirect,
  );
  assert.equal(h.output.at(-1).level, "info");
});

test("production browser logging sends only allowlisted event names, deduplicates and omits details", async () => {
  const submitted = [];
  const h = harness("production", {
    fetch: async (...args) => {
      submitted.push(args);
      return new Response(null, { status: 204 });
    },
  });
  const { browserEvents } = h.load("lib/logging/browser-events.ts");
  const [source, messages] = Object.entries(browserEvents)[0];
  const log = h
    .load("lib/logging/client.ts")
    .createClientLogger("service", source);
  log.error(messages[0], { password: "private", error: new Error("private") });
  log.error(messages[0]);
  log.error("not an application event");
  await Promise.resolve();
  assert.equal(submitted.length, 1);
  assert.equal(submitted[0][0], "/api/logs");
  assert.ok(!submitted[0][1].body.includes("private"));
});

test("browser ingestion rejects arbitrary messages, foreign origins and oversized bodies", async () => {
  const h = harness();
  const { POST } = h.load("app/api/logs/route.ts");
  const { browserEvents } = h.load("lib/logging/browser-events.ts");
  const [source, messages] = Object.entries(browserEvents)[0];
  const send = (event, origin = "https://example.com") =>
    POST(
      new Request("https://example.com/api/logs", {
        method: "POST",
        headers: { origin, "content-type": "application/json" },
        body: typeof event === "string" ? event : JSON.stringify(event),
      }),
    );
  assert.equal(
    (await send({ source, level: "error", message: messages[0] })).status,
    204,
  );
  assert.equal(
    (await send({ source, level: "error", message: "arbitrary secret" }))
      .status,
    400,
  );
  assert.equal((await send({}, "https://other.com")).status, 403);
  assert.equal((await send("x".repeat(5000))).status, 413);
  assert.ok(!JSON.stringify(h.output).includes("arbitrary secret"));
});

test("CloudWatch batches stay bounded and valid request IDs survive all nested operation logs", async () => {
  const h = harness("production");
  const { logContext, createLogContext } = h.load("lib/logging/context.ts");
  const { createLogger } = h.load("lib/logging/logger.ts");
  logContext.run(
    createLogContext(new Headers({ "x-vercel-id": "bom1::test" })),
    () => {
      const logger = createLogger("resources", "batch-test");
      for (let index = 0; index < 100; index++)
        logger.info("Resource event", { index, large: "a".repeat(1200) });
    },
  );
  await h.drain();
  const batches = h.commands.filter(
    (command) => command.kind === "PutLogEventsCommand",
  );
  assert.equal(batches.length, 3);
  for (const batch of batches) {
    assert.ok(batch.input.logEvents.length <= 40);
    assert.ok(
      batch.input.logEvents.reduce(
        (size, event) => size + Buffer.byteLength(event.message) + 26,
        0,
      ) < 1048576,
    );
    const times = batch.input.logEvents.map((event) => event.timestamp);
    assert.ok(
      times.every(
        (timestamp, index) => index === 0 || times[index - 1] <= timestamp,
      ),
    );
    assert.ok(
      batch.input.logEvents.every(
        (event) => JSON.parse(event.message).requestId === "bom1::test",
      ),
    );
  }
});

test("SDK middleware logs rejected provider status without logging command inputs", async () => {
  const h = harness();
  const { instrumentAwsClient } = h.load("lib/logging/aws.ts");
  let middleware;
  instrumentAwsClient(
    {
      middlewareStack: {
        add(fn) {
          middleware = fn;
        },
      },
    },
    "cognito",
  );
  const failure = Object.assign(new Error("private provider message"), {
    $metadata: { httpStatusCode: 400 },
  });
  await assert.rejects(
    middleware(
      async () => {
        throw failure;
      },
      { commandName: "InitiateAuthCommand" },
    )({ input: { password: "private-password" } }),
    (error) => error === failure,
  );
  assert.equal(h.output.at(-1).level, "warning");
  assert.ok(!JSON.stringify(h.output).includes("private"));
});

test("request instrumentation retains the original error request ID", async () => {
  const h = harness();
  const { withApiLogging } = h.load("lib/logging/api.ts");
  const error = new Error("failure");
  await assert.rejects(
    withApiLogging("/api/example", async () => {
      throw error;
    })(new Request("https://example.com")),
  );
  const originalId = h.output.at(-1).requestId;
  await h
    .load("instrumentation.ts")
    .onRequestError(
      error,
      { method: "GET", path: "/api/example", headers: {} },
      { routeType: "route", routePath: "/api/example" },
    );
  assert.equal(h.output.at(-1).requestId, originalId);
});
