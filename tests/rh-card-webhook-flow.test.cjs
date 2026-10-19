const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, modules = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
        },
      },
    ).outputText,
    {
      exports,
      Date,
      Buffer,
      console: { log() {}, error() {} },
      process: {
        env: {
          HDFC_SMARTGATEWAY_AUTHORIZATION: `Basic ${Buffer.from("test:secret").toString("base64")}`,
        },
      },
      require: (id) => {
        assert.ok(id in modules, `Unexpected dependency: ${id}`);
        return modules[id];
      },
      ...globals,
    },
  );
  return exports;
}

const constants = load("lib/constants.ts");
const details = {
  fullName: "Test Member",
  mobileNumber: "9876543210",
  gender: "female",
  dateOfBirth: "1995-01-01",
  state: "Rajasthan",
  city: "Jaipur",
  profession: "nursing_officer",
  qualification: "bsc_nursing",
  passportPhoto: "membership-cards/member/photo.jpg",
  termsAccepted: true,
};

function setup({ amount = constants.RH_ID_CARD_AMOUNT_INR, empty = false } = {}) {
  const table = (name, fields) =>
    Object.fromEntries(fields.map((field) => [field, `${name}.${field}`]));
  const tables = {
    payment: table("payment", [
      "id",
      "gatewayOrderId",
      "orderType",
      "email",
      "createdAt",
    ]),
    user: table("user", ["id", "email"]),
    userCard: table("card", ["id", "userId", "createdAt"]),
  };
  const account = { id: "member", email: "member@example.com" };
  let state = {
    users: [account],
    cards: [],
    payments: empty
      ? []
      : [
          {
            id: "payment-1",
            orderId: "card-1",
            gatewayOrderId: "RHC1",
            orderType: "product",
            email: account.email,
            amount,
            amountPaid: 0,
            amountDue: amount,
            currency: "INR",
            status: "pending",
            notes: JSON.stringify({
              kind: "rh_id_card",
              userId: account.id,
              details,
              checkout: {
                paymentUrl: "https://checkout.example.com",
                expiresAt: "2099-01-01",
              },
            }),
          },
        ],
  };
  const controls = {
    failCardUpdate: false,
    failQueue: false,
    queueSends: 0,
    sessions: [],
  };
  const rows = (target) =>
    target === tables.payment
      ? state.payments
      : target === tables.user
        ? state.users
        : state.cards;
  const matches = (row, condition) =>
    !condition ||
    (condition.parts
      ? condition.parts.every((part) => matches(row, part))
      : row[condition.field.split(".")[1]] === condition.value);
  const db = {
    select: () => ({
      from: (target) => {
        let condition;
        let count = Infinity;
        const query = {
          where: (value) => {
            condition = value;
            return query;
          },
          orderBy: () => query,
          limit: (value) => {
            count = value;
            return query;
          },
          for: () => query,
          then: (resolve, reject) =>
            Promise.resolve(
              structuredClone(
                rows(target)
                  .filter((row) => matches(row, condition))
                  .slice(0, count),
              ),
            ).then(resolve, reject),
        };
        return query;
      },
    }),
    insert: (target) => ({
      values: (values) => ({
        returning: async () => {
          const row = {
            id: "payment-1",
            memberShipNumber: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...values,
          };
          rows(target).push(row);
          return [structuredClone(row)];
        },
      }),
    }),
    update: (target) => ({
      set: (values) => ({
        where: (condition) => {
          const update = async () => {
            if (target === tables.userCard && controls.failCardUpdate)
              throw new Error("Card database update failed");
            const affected = rows(target).filter((row) =>
              matches(row, condition),
            );
            affected.forEach((row) => Object.assign(row, values));
            return structuredClone(affected);
          };
          return {
            returning: update,
            then: (resolve, reject) => update().then(resolve, reject),
          };
        },
      }),
    }),
    transaction: async (callback) => {
      const before = structuredClone(state);
      try {
        return await callback(db);
      } catch (error) {
        state = before;
        throw error;
      }
    },
  };
  const orm = {
    eq: (field, value) => ({ field, value }),
    and: (...parts) => ({ parts }),
    desc: (field) => field,
  };
  const gateway = {
    getHdfcOrderStatus: async () => ({
      status: "CHARGED",
      order_id: "RHC1",
      amount,
      currency: "INR",
      txn_id: "txn-1",
    }),
    normalizeHdfcOrderStatus: (status) =>
      status === "CHARGED" ? "completed" : "pending",
    createHdfcCustomerId: (id) => id,
    createHdfcGatewayOrderId: () => "RHC1",
    createHdfcPaymentSession: async (input) => {
      controls.sessions.push(input);
      return {
        id: "session-1",
        payment_links: {
          web: "https://checkout.example.com",
          expiry: "2099-01-01",
        },
      };
    },
  };
  const modules = {
    "server-only": {},
    "node:crypto": require("node:crypto"),
    "drizzle-orm": orm,
    "@/db": tables,
    "@/db/userSchema": {
      userCardSchema: tables.userCard,
      userSchema: tables.user,
    },
    "@/lib/mobileApiAuth": {
      getAuthenticatedApiEmail: async () => account.email,
    },
    "@/lib/dbConfig": { db },
    "@/lib/constants": constants,
    "@/lib/publicAsset": {
      publicAssetUrl: (key) => key,
      isMembershipPhotoKey: (key, id) =>
        key?.startsWith(`membership-cards/${id}/`),
    },
    "@/lib/hdfcGateway": gateway,
    "next/server": {
      NextResponse: {
        json: (body, options) => ({ body, status: options?.status || 200 }),
      },
    },
    "@aws-sdk/client-sqs": {
      SendMessageCommand: class {
        constructor(input) {
          this.input = input;
        }
      },
      SQSClient: class {
        async send() {
          if (controls.failQueue) throw new Error("Invoice queue unavailable");
          controls.queueSends++;
        }
      },
    },
  };
  modules["@/lib/rhIdCard"] = load("lib/rhIdCard.ts", modules);
  modules["@/lib/rhIdCardPayment"] = load("lib/rhIdCardPayment.ts", modules);
  modules["@/lib/invoiceQueue"] = load("lib/invoiceQueue.ts", modules);
  modules["@/lib/paymentConfirmation"] = load(
    "lib/paymentConfirmation.ts",
    modules,
  );
  const webhook = load("app/api/verify-payment/route.ts", modules);
  const statusApi = load("app/api/payment-status/route.ts", modules);
  const cardApi = load("app/api/auth/mobile/id-card/route.ts", modules);
  return {
    get state() {
      return state;
    },
    controls,
    account,
    start: () =>
      modules["@/lib/rhIdCardPayment"].startRhCardPurchase(
        account,
        modules["@/lib/rhIdCard"].validateInput(details),
      ),
    webhook: (event = "ORDER_SUCCEEDED", authorized = true) =>
      webhook.POST(
        new Request("https://example.com/api/verify-payment", {
          method: "POST",
          headers: {
            authorization: authorized
              ? `Basic ${Buffer.from("test:secret").toString("base64")}`
              : "invalid",
          },
          body: JSON.stringify({
            event_name: event,
            content: {
              order: { order_id: "RHC1", status: "CHARGED", txn_id: "txn-1" },
            },
          }),
        }),
      ),
    status: () =>
      statusApi.POST(
        new Request("https://example.com/api/payment-status", {
          method: "POST",
          body: JSON.stringify({ orderId: "RHC1" }),
        }),
      ),
    card: () =>
      cardApi.GET(new Request("https://example.com/api/auth/mobile/id-card")),
  };
}

test("checkout creates a pending INR 501 order; only the webhook creates a two-year card", async () => {
  const app = setup({ empty: true });
  await app.start();
  assert.equal(app.controls.sessions[0].amount, 501);
  assert.equal(app.state.payments[0].status, "pending");
  assert.equal(app.state.cards.length, 0);
  assert.equal((await app.card()).body.pendingPurchase.status, "pending");
  assert.equal((await app.status()).body.normalizedStatus, "completed");
  assert.equal(app.state.payments[0].status, "pending");
  assert.equal(app.state.cards.length, 0);
  assert.equal(app.controls.queueSends, 0);
  assert.equal((await app.webhook()).status, 200);
  const card = app.state.cards[0];
  assert.equal(card.isActive, true);
  assert.equal(
    card.validityDate.getFullYear(),
    card.activationDate.getFullYear() + 2,
  );
  assert.ok(card.memberShipId);
  assert.equal(app.state.payments[0].status, "completed");
  assert.equal(app.state.payments[0].amountPaid, 501);
  assert.equal(app.state.payments[0].amountDue, 0);
  assert.equal(app.controls.queueSends, 1);
  const dashboard = (await app.card()).body;
  assert.equal(dashboard.card.id, card.id);
  assert.equal(dashboard.pendingPurchase, null);
});

test("duplicate success preserves the card and queues its invoice once", async () => {
  const app = setup();
  await app.webhook();
  const original = structuredClone(app.state.cards[0]);
  await app.webhook();
  assert.equal(app.state.cards.length, 1);
  assert.deepEqual(app.state.cards[0], original);
  assert.equal(app.controls.queueSends, 1);
});

test("card write failure rolls back completion and webhook retry recovers", async () => {
  const app = setup();
  app.controls.failCardUpdate = true;
  assert.equal((await app.webhook()).status, 500);
  assert.equal(app.state.cards.length, 0);
  assert.equal(app.state.payments[0].status, "pending");
  assert.equal(app.controls.queueSends, 0);
  app.controls.failCardUpdate = false;
  assert.equal((await app.webhook()).status, 200);
  assert.equal(app.state.cards.length, 1);
  assert.equal(app.state.payments[0].status, "completed");
});

test("invoice queue failure is retried without duplicating the saved card", async () => {
  const app = setup();
  app.controls.failQueue = true;
  assert.equal((await app.webhook()).status, 500);
  assert.equal(app.state.payments[0].status, "completed");
  assert.equal(app.state.cards.length, 1);
  app.controls.failQueue = false;
  assert.equal((await app.webhook()).status, 200);
  assert.equal(app.state.cards.length, 1);
  assert.equal(app.controls.queueSends, 1);
});

test("failed payment creates no card, and late failure or failed refund preserves completion", async () => {
  const app = setup();
  await app.webhook("ORDER_FAILED");
  assert.equal(app.state.payments[0].status, "failed");
  assert.equal(app.state.cards.length, 0);
  assert.equal((await app.card()).body.pendingPurchase, null);
  await app.webhook();
  await app.webhook("ORDER_FAILED");
  await app.webhook("ORDER_REFUND_FAILED");
  assert.equal(app.state.payments[0].status, "completed");
  assert.equal(app.state.cards[0].isActive, true);
  assert.equal(app.controls.queueSends, 1);
});

test("refund deactivates the card; duplicate refund and delayed success cannot reactivate it", async () => {
  const app = setup();
  await app.webhook();
  await app.webhook("ORDER_REFUNDED");
  await app.webhook("ORDER_REFUNDED");
  await app.webhook();
  assert.equal(app.state.payments[0].status, "refunded");
  assert.equal(app.state.payments[0].amountPaid, 0);
  assert.equal(app.state.cards[0].isActive, false);
  assert.equal(app.controls.queueSends, 1);
});

test("a deleted card is recreated only by a successful webhook retry", async () => {
  const app = setup();
  await app.webhook();
  const id = app.state.cards[0].id;
  app.state.cards.length = 0;
  assert.equal((await app.card()).body.pendingPurchase.status, "completed");
  await app.status();
  assert.equal(app.state.cards.length, 0);
  await app.webhook();
  assert.equal(app.state.cards[0].id, id);
  assert.equal(app.controls.queueSends, 1);
});

for (const amount of [1, 21, 501]) {
  test(`existing INR ${amount} purchases retain their saved amount during fulfillment`, async () => {
    const app = setup({ amount });
    assert.equal((await app.webhook()).status, 200);
    assert.equal(app.state.payments[0].amountPaid, amount);
    assert.equal(app.state.cards.length, 1);
  });
}

test("unauthenticated webhook cannot change the database or enqueue an invoice", async () => {
  const app = setup();
  assert.equal((await app.webhook("ORDER_SUCCEEDED", false)).status, 401);
  assert.equal(app.state.payments[0].status, "pending");
  assert.equal(app.state.cards.length, 0);
  assert.equal(app.controls.queueSends, 0);
});

function renderPanel(result) {
  const React = require("react");
  const effects = [];
  const updates = [];
  const timers = [];
  const cleared = [];
  let stateIndex = 0;
  const listeners = new Map();
  const document = {
    visibilityState: "visible",
    addEventListener: (event, callback) => listeners.set(event, callback),
    removeEventListener: (event) => listeners.delete(event),
  };
  const { RhIdCardPanel } = load(
    "components/id-card/RhIdCardPanel.tsx",
    {
      "react/jsx-runtime": require("react/jsx-runtime"),
      react: {
        useState: (initial) => {
          const index = stateIndex++;
          return [
            index === 0 ? result : initial,
            (value) => updates.push({ index, value }),
          ];
        },
        useEffect: (effect) => effects.push(effect),
      },
      "next/link": {
        default: ({ children, href }) =>
          React.createElement("a", { href }, children),
      },
      "next/navigation": { useRouter: () => ({ refresh() {} }) },
      "lucide-react": { IdCard: () => null },
      "@/components/ui/button": {
        Button: ({ children }) => React.createElement("button", null, children),
      },
      "./IdCardForm": { IdCardForm: () => "Create membership form" },
      "./IdCardView": { IdCardView: () => "Saved membership card" },
      "./RhCardBenefits": { RhCardBenefits: () => null },
      "../ui/skeleton": { Skeleton: () => "Loading" },
    },
    {
      document,
      setTimeout: (callback, delay) => {
        timers.push({ callback, delay });
        return 1;
      },
      clearTimeout: (id) => cleared.push(id),
    },
  );
  return {
    html: require("react-dom/server").renderToStaticMarkup(RhIdCardPanel({})),
    effects,
    updates,
    timers,
    listeners,
    cleared,
    document,
  };
}

test("dashboard removes Verify payment and waits for webhook confirmation", () => {
  const panel = renderPanel({
    success: true,
    card: null,
    pendingPurchase: {
      status: "pending",
      paymentUrl: "https://checkout.example.com",
    },
  });
  assert.match(panel.html, /payment is pending/);
  assert.match(panel.html, /Continue payment/);
  assert.match(panel.html, /do not pay again/);
  assert.doesNotMatch(panel.html, /Verify payment/);
  const cleanup = panel.effects[1]();
  assert.equal(panel.timers[0].delay, 10000);
  panel.timers[0].callback();
  assert.equal(panel.updates.length, 1);
  assert.equal(panel.updates[0].index, 2);
  panel.document.visibilityState = "hidden";
  panel.timers[0].callback();
  assert.equal(panel.updates.length, 1);
  panel.document.visibilityState = "visible";
  panel.listeners.get("visibilitychange")();
  assert.equal(panel.updates.length, 2);
  cleanup();
  assert.deepEqual(panel.cleared, [1]);
  assert.equal(panel.listeners.size, 0);
});

test("missing paid card shows confirmation and support guidance without another payment button", () => {
  const panel = renderPanel({
    success: true,
    card: null,
    pendingPurchase: {
      status: "completed",
      paymentUrl: null,
    },
  });
  assert.match(panel.html, /payment is confirmed/);
  assert.match(panel.html, /contact support/);
  assert.doesNotMatch(
    panel.html,
    /Verify payment|Continue payment|Create membership form/,
  );
});

test("dashboard shows the saved card and stops refreshing after webhook fulfillment", () => {
  const panel = renderPanel({ success: true, card: { id: "card-1" } });
  assert.match(panel.html, /Saved membership card/);
  assert.doesNotMatch(panel.html, /Verify payment|Continue payment/);
  panel.effects[1]();
  assert.equal(panel.timers.length, 0);
});
