const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, modules, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(
    code,
    {
      exports,
      Buffer,
      URL,
      console,
      ...globals,
      require: (name) => {
        if (!(name in modules))
          throw new Error(`Unexpected dependency ${name}`);
        return modules[name];
      },
    },
    { filename: file },
  );
  return exports;
}
const products = load("lib/apple/products.ts", {});
const buyerId = "10000000-0000-4000-8000-000000000001";
const courseId = "20000000-0000-4000-8000-000000000001";
class ApplePurchaseError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
function harness(options = {}) {
  const tables = Object.fromEntries(
    ["user", "course", "courseEnrolment", "payment"].map((name) => [
      name,
      new Proxy(
        { name },
        { get: (target, key) => (key === "name" ? name : { key }) },
      ),
    ]),
  );
  let rows = {
    user: [{ id: buyerId, email: "buyer@example.com" }],
    course: [
      { id: courseId, slug: "nrpfornurses", title: "NRP", isActive: true },
    ],
    courseEnrolment: options.enrolments || [],
    payment: [],
  };
  let serial = Promise.resolve();
  const db = {
    select: () => ({
      from: (table) => {
        let filter = () => true;
        let limit = Infinity;
        const query = {
          where(predicate) {
            filter = predicate;
            return query;
          },
          orderBy() {
            return query;
          },
          limit(value) {
            limit = value;
            return query;
          },
          then(resolve, reject) {
            return Promise.resolve(
              rows[table.name].filter(filter).slice(0, limit),
            ).then(resolve, reject);
          },
        };
        return query;
      },
    }),
    insert: (table) => ({
      values: (value) => {
        const created = {
          id: `${table.name}-${rows[table.name].length + 1}`,
          ...value,
        };
        rows[table.name].push(created);
        return {
          returning: async () => [created],
          then: (resolve) => Promise.resolve().then(resolve),
        };
      },
    }),
    update: (table) => ({
      set: (values) => ({
        where: async (predicate) => {
          rows[table.name]
            .filter(predicate)
            .forEach((row) => Object.assign(row, values));
        },
      }),
    }),
    execute: async () => {},
    transaction: (fn) => {
      const run = serial.then(async () => {
        const snapshot = structuredClone(rows);
        try {
          return await fn(db);
        } catch (error) {
          rows = snapshot;
          throw error;
        }
      });
      serial = run.catch(() => {});
      return run;
    },
  };
  const transaction = {
    type: "Non-Consumable",
    inAppOwnershipType: "PURCHASED",
    appAccountToken: buyerId,
    transactionId: "12345",
    originalTransactionId: "12345",
    environment: "Production",
    productId: "nrpfornurses",
    price: 1499990,
    currency: "INR",
    purchaseDate: 1700000000000,
    ...options.transaction,
  };
  let verifications = 0;
  const modules = {
    "next/server": {
      NextResponse: {
        json: (data, init = {}) => ({ status: init.status || 200, data }),
      },
    },
    "drizzle-orm": {
      eq: (field, value) => (row) => row[field.key] === value,
      ne: (field, value) => (row) => row[field.key] !== value,
      and:
        (...filters) =>
        (row) =>
          filters.every((f) => f(row)),
      inArray: (field, values) => (row) => values.includes(row[field.key]),
      desc: () => {},
      sql: () => {},
    },
    "@/db": tables,
    "@/lib/dbConfig": { db },
    "@/lib/mobileApiAuth": {
      getAuthenticatedApiEmail: async () =>
        options.unauthenticated ? null : "buyer@example.com",
    },
    "@/lib/apple/products": products,
    "@/lib/apple/verification": {
      ApplePurchaseError,
      appleConfiguration: () => {
        if (options.unconfigured)
          throw new ApplePurchaseError("Not configured", 503);
      },
      verifyAppleTransaction: async () => {
        verifications++;
        if (options.verificationFailure)
          throw new ApplePurchaseError("Apple unavailable", 502);
        return transaction;
      },
    },
  };
  const route = load("app/api/auth/mobile/purchases/apple/route.ts", modules);
  return {
    route,
    modules,
    transaction,
    get rows() {
      return rows;
    },
    get verifications() {
      return verifications;
    },
    request: (body = { transactionId: "12345" }) => ({
      json: async () => body,
      url: `https://example.com/api?courseId=${courseId}`,
    }),
  };
}

test("catalog maps all three current slugs and older URLs", () => {
  for (const id of [
    "nrpfornurses",
    "palsfornurses",
    "triageemergenciesfornurses",
  ]) {
    assert.equal(products.appleProductForSlug(id), id);
    assert.ok(products.courseSlugsForAppleProduct(id).includes(id));
  }
  assert.equal(
    products.appleProductForSlug("/courses/nrp-for-nurses"),
    "nrpfornurses",
  );
  assert.equal(products.appleProductForSlug("unknown"), undefined);
});
test("checkout preparation uses server account UUID and rejects missing config", async () => {
  const h = harness();
  const response = await h.route.GET(h.request());
  assert.equal(response.data.appAccountToken, buyerId);
  assert.equal(response.data.productId, "nrpfornurses");
  assert.equal(
    (await harness({ unconfigured: true }).route.GET(h.request())).status,
    503,
  );
});
test("unauthenticated or malformed requests never verify or write", async () => {
  const h = harness({ unauthenticated: true });
  assert.equal((await h.route.POST(h.request())).status, 401);
  assert.equal(h.verifications, 0);
  const validAuth = harness();
  for (const body of [null, {}, { transactionId: "../foo" }]) {
    assert.equal(
      (await validAuth.route.POST(validAuth.request(body))).status,
      400,
    );
  }
  assert.equal(validAuth.verifications, 0);
});
test("verified transaction decides product and price, ignoring client overrides", async () => {
  const h = harness();
  const result = await h.route.POST(
    h.request({
      transactionId: "12345",
      productId: "palsfornurses",
      amount: 0,
      status: "completed",
      appAccountToken: "someone-else",
    }),
  );
  assert.equal(result.status, 200);
  assert.equal(h.rows.courseEnrolment[0].courseId, courseId);
  assert.equal(h.rows.payment[0].applePriceMilliunits, 1499990);
  assert.equal(h.rows.payment[0].appleProductId, "nrpfornurses");
  assert.equal(h.rows.payment[0].appleAccountToken, buyerId);
});
test("concurrent retry and later restore produce one payment and enrolment", async () => {
  const h = harness();
  const results = await Promise.all([
    h.route.POST(h.request()),
    h.route.POST(h.request()),
  ]);
  assert.ok(results.every((r) => r.status === 200));
  assert.equal((await h.route.POST(h.request())).status, 200);
  assert.equal(h.rows.payment.length, 1);
  assert.equal(h.rows.courseEnrolment.length, 1);
});
test("ownership, revocation, product type, family sharing and unknown SKU fail closed", async () => {
  for (const transaction of [
    { appAccountToken: "another-user" },
    { appAccountToken: undefined },
    { revocationDate: 123 },
    { type: "Consumable" },
    { inAppOwnershipType: "FAMILY_SHARED" },
    { productId: "unknown" },
  ]) {
    const h = harness({ transaction });
    assert.ok((await h.route.POST(h.request())).status >= 400);
    assert.equal(h.rows.payment.length, 0);
    assert.equal(h.rows.courseEnrolment.length, 0);
  }
});
test("Apple outage grants no access and leaves the purchase retryable", async () => {
  const h = harness({ verificationFailure: true });
  assert.equal((await h.route.POST(h.request())).status, 502);
  assert.equal(h.rows.payment.length, 0);
});
test("a pending website enrolment is not reused by Apple", async () => {
  const h = harness({
    enrolments: [
      { id: "website", userId: buyerId, courseId, enrolmentStatus: "pending" },
    ],
  });
  assert.equal((await h.route.POST(h.request())).status, 200);
  assert.equal(h.rows.courseEnrolment.length, 2);
  assert.equal(h.rows.courseEnrolment[0].enrolmentStatus, "pending");
  assert.notEqual(h.rows.payment[0].orderId, "website");
});
test("existing active access blocks checkout but can attach a valid restore", async () => {
  const h = harness({
    enrolments: [
      {
        id: "existing",
        userId: buyerId,
        courseId,
        enrolmentStatus: "enrolled",
      },
    ],
  });
  assert.equal((await h.route.GET(h.request())).status, 409);
  assert.equal((await h.route.POST(h.request())).status, 200);
  assert.equal(h.rows.courseEnrolment.length, 1);
  assert.equal(h.rows.payment[0].orderId, "existing");
});
test("Apple signature verifier rejects fabricated transactions", async () => {
  const {
    SignedDataVerifier,
    Environment,
  } = require("@apple/app-store-server-library");
  const { appleRootCertificates } = load("lib/apple/rootCertificate.ts", {});
  const verifier = new SignedDataVerifier(
    appleRootCertificates,
    false,
    Environment.PRODUCTION,
    "com.rh.healthcare",
    6803631027,
  );
  const fabricated = `${Buffer.from('{"alg":"none"}').toString("base64url")}.${Buffer.from('{"productId":"nrpfornurses"}').toString("base64url")}.fake`;
  await assert.rejects(verifier.verifyAndDecodeTransaction(fabricated));
});

test("signed refund/reversal notifications update access idempotently", async () => {
  const h = harness();
  await h.route.POST(h.request());
  let type = "REFUND";
  const route = load("app/api/apple/notifications/route.ts", {
    ...h.modules,
    jose: { decodeJwt: () => ({ transactionId: "12345" }) },
    "@/lib/apple/verification": {
      ...h.modules["@/lib/apple/verification"],
      verifyAppleNotification: async () => ({
        notificationType: type,
        data: { signedTransactionInfo: "signed" },
      }),
    },
  });
  h.transaction.revocationDate = 123;
  const request = () => ({
    json: async () => ({ signedPayload: "verified-by-mock" }),
  });
  assert.equal((await route.POST(request())).status, 200);
  assert.equal((await route.POST(request())).status, 200);
  assert.equal(h.rows.payment.length, 1);
  assert.equal(h.rows.payment[0].status, "refunded");
  assert.equal(h.rows.courseEnrolment[0].enrolmentStatus, "refunded");
  type = "REFUND_REVERSED";
  delete h.transaction.revocationDate;
  await route.POST(request());
  assert.equal(h.rows.payment[0].status, "completed");
  assert.equal(h.rows.courseEnrolment[0].enrolmentStatus, "enrolled");
});

test("unverified notifications cannot change course access", async () => {
  const h = harness();
  await h.route.POST(h.request());
  const route = load("app/api/apple/notifications/route.ts", {
    ...h.modules,
    jose: {},
    "@/lib/apple/verification": {
      ...h.modules["@/lib/apple/verification"],
      verifyAppleNotification: async () => {
        throw new ApplePurchaseError("Invalid signature", 422);
      },
    },
  });
  assert.equal(
    (await route.POST({ json: async () => ({ signedPayload: "forged" }) }))
      .status,
    422,
  );
  assert.equal(h.rows.payment[0].status, "completed");
  assert.equal(h.rows.courseEnrolment[0].enrolmentStatus, "enrolled");
});

test("sandbox fallback is explicit and limited to transaction-not-found errors", async () => {
  const environments = [];
  let responseError = 4040010;
  class APIException extends Error {
    constructor(code) {
      super("API error");
      this.apiError = code;
    }
  }
  const modules = {
    "server-only": {},
    "./rootCertificate": { appleRootCertificates: [] },
    "@apple/app-store-server-library": {
      APIException,
      Environment: { PRODUCTION: "Production", SANDBOX: "Sandbox" },
      AppStoreServerAPIClient: class {
        constructor(key, keyId, issuer, bundle, environment) {
          this.environment = environment;
        }
        async getTransactionInfo() {
          environments.push(this.environment);
          if (this.environment === "Production")
            throw new APIException(responseError);
          return { signedTransactionInfo: "signed" };
        }
      },
      SignedDataVerifier: class {
        async verifyAndDecodeTransaction() {
          return { transactionId: "12345" };
        }
      },
    },
  };
  const env = {
    APPLE_IAP_PRIVATE_KEY: "test",
    APPLE_IAP_KEY_ID: "key",
    APPLE_IAP_ISSUER_ID: "issuer",
    APPLE_IAP_ALLOW_SANDBOX: "true",
  };
  const verifier = load("lib/apple/verification.ts", modules, {
    process: { env },
  });
  await verifier.verifyAppleTransaction("12345");
  assert.deepEqual(environments, ["Production", "Sandbox"]);
  environments.length = 0;
  responseError = 4010000;
  await assert.rejects(verifier.verifyAppleTransaction("12345"));
  assert.deepEqual(environments, ["Production"]);
  environments.length = 0;
  responseError = 4040010;
  env.APPLE_IAP_ALLOW_SANDBOX = "false";
  await assert.rejects(verifier.verifyAppleTransaction("12345"));
  assert.deepEqual(environments, ["Production"]);
});
