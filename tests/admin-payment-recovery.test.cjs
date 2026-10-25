const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function load(file, mocks) {
  const exports = {};
  const compiled = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  new Function("require", "exports", compiled)((name) => {
    if (name in require("./helpers/logging.cjs"))
      return require("./helpers/logging.cjs")[name];
    if (name in mocks) return mocks[name];
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`, mocks);
    return require(name);
  }, exports);
  return exports;
}

const paymentId = "11111111-1111-4111-8111-111111111111";
const purchaseId = "22222222-2222-4222-8222-222222222222";

function setup({
  orderType = "workshop",
  email = "bishnoi11011@gmail.com",
} = {}) {
  const tables = Object.fromEntries(
    [
      "payment",
      "workshopRegistration",
      "courseEnrolment",
      "seminarRegistrations",
    ].map((name) => [
      name,
      Object.fromEntries(
        ["id", "gatewayOrderId", "status", "notes"].map((field) => [
          field,
          `${name}.${field}`,
        ]),
      ),
    ]),
  );
  let state = {
    payment: [
      {
        id: paymentId,
        orderId: purchaseId,
        gatewayOrderId: "HDFC_RECOVERY_1",
        orderType,
        amount: 501,
        amountPaid: 0,
        amountDue: 501,
        currency: "INR",
        status: "pending",
        notes: null,
        email: "member@example.com",
        contact: "9876543210",
        tokenId: "private-token",
        responseObject: { private: "payload" },
      },
    ],
    workshopRegistration: [{ id: purchaseId, paymentStatus: "pending" }],
    courseEnrolment: [{ id: purchaseId, enrolmentStatus: "pending" }],
    seminarRegistrations: [{ id: purchaseId, paymentStatus: "pending" }],
    cards: [],
  };
  const controls = {
    email,
    lookups: 0,
    sends: [],
    events: [],
    queries: 0,
    failQueue: false,
    failPurchase: false,
    failCard: false,
    cardCalls: 0,
    gateway: {
      order_id: "HDFC_RECOVERY_1",
      status: "CHARGED",
      amount: "501.00",
      currency: "INR",
      txn_id: "txn-1",
      payment_method_type: "UPI",
      token: "private-gateway-token",
    },
  };
  const tableName = (table) =>
    Object.keys(tables).find((name) => tables[name] === table);
  const matches = (row, condition) =>
    !condition ||
    (condition.or
      ? condition.or.some((part) => matches(row, part))
      : row[condition.field.split(".")[1]] === condition.value);
  const db = {
    select: () => {
      controls.queries++;
      return {
        from: (table) => {
          let condition;
          let limit = Infinity;
          const query = {
            where: (value) => {
              condition = value;
              return query;
            },
            limit: (value) => {
              limit = value;
              return query;
            },
            for: () => query,
            then: (resolve, reject) =>
              Promise.resolve(
                structuredClone(
                  state[tableName(table)]
                    .filter((row) => matches(row, condition))
                    .slice(0, limit),
                ),
              ).then(resolve, reject),
          };
          return query;
        },
      };
    },
    update: (table) => ({
      set: (values) => ({
        where: async (condition) => {
          const name = tableName(table);
          if (name !== "payment" && controls.failPurchase)
            throw new Error("Purchase update failed");
          controls.events.push(`update:${name}`);
          state[name]
            .filter((row) => matches(row, condition))
            .forEach((row) => Object.assign(row, values));
        },
      }),
    }),
    transaction: async (callback) => {
      const before = structuredClone(state);
      try {
        const result = await callback(db);
        controls.events.push("commit");
        return result;
      } catch (error) {
        state = before;
        throw error;
      }
    },
  };
  const mocks = {
    "server-only": {},
    "@/auth": {
      auth: async () =>
        controls.email ? { user: { email: controls.email } } : null,
    },
    "next/navigation": {
      redirect: (url) => {
        throw new Error(`redirect:${url}`);
      },
    },
    "next/cache": {
      revalidatePath: (value) => controls.events.push(`revalidate:${value}`),
    },
    "@/db": tables,
    "@/lib/dbConfig": { db },
    "drizzle-orm": {
      eq: (field, value) => ({ field, value }),
      or: (...parts) => ({ or: parts.filter(Boolean) }),
    },
    "@/lib/hdfcGateway": {
      getHdfcOrderStatus: async () => {
        controls.lookups++;
        if (controls.gateway instanceof Error) throw controls.gateway;
        return structuredClone(controls.gateway);
      },
      normalizeHdfcOrderStatus: (status) =>
        status === "CHARGED" ? "completed" : "pending",
    },
    "@/lib/rhIdCardPayment": {
      isRhCardPayment: (record) => record.orderType === "product",
      confirmRhCardPayment: async () => {
        controls.cardCalls++;
        if (controls.failCard) throw new Error("Invalid membership details");
        Object.assign(state.payment[0], {
          status: "completed",
          amountPaid: 501,
          amountDue: 0,
        });
        if (!state.cards.length)
          state.cards.push({ id: purchaseId, isActive: true });
        controls.events.push("card-fulfilled");
        return { status: "completed", alreadyCompleted: false };
      },
    },
    "@aws-sdk/client-sqs": {
      SendMessageCommand: class {
        constructor(input) {
          this.input = input;
        }
      },
      SQSClient: class {
        async send(command) {
          assert.equal(state.payment[0].status, "completed");
          assert.equal(state.payment[0].amountPaid, 501);
          assert.equal(state.payment[0].amountDue, 0);
          if (orderType === "workshop")
            assert.equal(
              state.workshopRegistration[0].paymentStatus,
              "completed",
            );
          if (orderType === "seminar")
            assert.equal(
              state.seminarRegistrations[0].paymentStatus,
              "completed",
            );
          if (orderType === "course")
            assert.equal(state.courseEnrolment[0].enrolmentStatus, "enrolled");
          if (orderType === "product")
            assert.equal(state.cards[0].isActive, true);
          if (controls.failQueue) throw new Error("SQS unavailable");
          controls.sends.push(command.input);
          controls.events.push("sqs");
          return { MessageId: "message-1" };
        }
      },
    },
  };
  mocks["@/lib/invoiceQueue"] = load("lib/invoiceQueue.ts", mocks);
  mocks["@/lib/paymentConfirmation"] = load(
    "lib/paymentConfirmation.ts",
    mocks,
  );
  const api = load("actions/paymentRecoveryActions.ts", mocks);
  return {
    api,
    controls,
    mocks,
    get state() {
      return state;
    },
  };
}

for (const email of [
  null,
  "visitor@example.com",
  "rhhealthcaresimulationcenter@gmail.com",
]) {
  test(`both recovery actions deny ${email || "anonymous users"} before DB or HDFC access`, async () => {
    const app = setup({ email });
    for (const action of [
      app.api.inspectAdminPayment,
      app.api.recoverAdminPayment,
    ])
      await assert.rejects(action(paymentId), /redirect:/);
    assert.equal(app.controls.queries, 0);
    assert.equal(app.controls.lookups, 0);
    assert.equal(app.controls.sends.length, 0);
  });
}

test("preview accepts either ID and exposes only payment details without writes or queue sends", async () => {
  const app = setup();
  for (const reference of [paymentId, " HDFC_RECOVERY_1 "]) {
    const result = await app.api.inspectAdminPayment(reference);
    assert.equal(result.success, true);
    assert.equal(result.payment.canRecover, true);
    assert.equal(result.payment.gatewayAmount, 501);
    assert.equal(result.payment.paymentMethod, "UPI");
    assert.doesNotMatch(
      JSON.stringify(result),
      /private|tokenId|responseObject/,
    );
  }
  assert.equal(app.state.payment[0].status, "pending");
  assert.deepEqual(app.controls.events, []);
});

for (const orderType of ["workshop", "course", "seminar", "product"]) {
  test(`${orderType}: fulfillment completes before the internal payment UUID is sent to SQS; retry does not resend`, async () => {
    const app = setup({ orderType });
    const result = await app.api.recoverAdminPayment(paymentId);
    assert.equal(result.success, true);
    assert.equal(result.payment.status, "completed");
    assert.ok(result.payment.invoiceQueuedAt);
    assert.equal(
      app.controls.sends[0].MessageBody,
      JSON.stringify({ paymentId }),
    );
    assert.equal(app.controls.sends[0].DelaySeconds, 0);
    if (orderType !== "product") {
      assert.equal(app.state.payment[0].transactionId, "txn-1");
      assert.equal(app.state.payment[0].responseObject.status, "CHARGED");
    }
    assert.equal((await app.api.recoverAdminPayment(paymentId)).success, true);
    assert.equal(app.controls.sends.length, 1);
    if (orderType === "product") assert.equal(app.state.cards.length, 1);
  });
}

for (const patch of [
  { status: "PENDING" },
  { status: "FAILED" },
  { order_id: "another-order" },
  { order_id: undefined },
  { amount: "500" },
  { amount: "" },
  { amount: 0 },
  { amount: undefined },
  { amount: "NaN" },
  { currency: "USD" },
  { currency: undefined },
  { txn_id: undefined },
  { refunded: true },
  { amount_refunded: "1.00" },
  { refunds: [{ status: "PENDING" }] },
]) {
  test(`recovery blocks unverified payment ${JSON.stringify(patch)}`, async () => {
    const app = setup();
    Object.assign(app.controls.gateway, patch);
    const result = await app.api.recoverAdminPayment(paymentId);
    assert.equal(result.success, false);
    assert.equal(result.payment.canRecover, false);
    assert.deepEqual(app.controls.events, []);
    assert.equal(app.state.payment[0].status, "pending");
  });
}

test("nested transaction details are accepted and the order ID is never used as transaction ID", async () => {
  const app = setup();
  Object.assign(app.controls.gateway, {
    txn_id: undefined,
    amount: undefined,
    currency: undefined,
    txn_detail: { txn_id: "nested-txn", txn_amount: "501", currency: "INR" },
  });
  assert.equal((await app.api.recoverAdminPayment(paymentId)).success, true);
  assert.equal(app.state.payment[0].transactionId, "nested-txn");
});

test("completion rechecks HDFC and blocks a changed status after a successful preview", async () => {
  const app = setup();
  assert.equal(
    (await app.api.inspectAdminPayment(paymentId)).payment.canRecover,
    true,
  );
  app.controls.gateway.status = "PENDING";
  assert.equal((await app.api.recoverAdminPayment(paymentId)).success, false);
  assert.equal(app.controls.lookups, 2);
  assert.equal(app.state.payment[0].status, "pending");
});

test("a missing purchase, refunded local payment or Apple purchase cannot be recovered", async () => {
  for (const kind of ["missing", "refunded", "apple"]) {
    const app = setup();
    if (kind === "missing") app.state.workshopRegistration = [];
    if (kind === "refunded") app.state.payment[0].status = "refunded";
    if (kind === "apple")
      app.state.payment[0].appleOriginalTransactionId = "apple-1";
    assert.equal((await app.api.recoverAdminPayment(paymentId)).success, false);
    assert.equal(app.controls.sends.length, 0);
    assert.deepEqual(app.controls.events, []);
  }
});

test("SQS failure preserves fulfillment and a later recovery queues the invoice once", async () => {
  const app = setup();
  app.controls.failQueue = true;
  assert.equal((await app.api.recoverAdminPayment(paymentId)).success, false);
  assert.equal(app.state.payment[0].status, "completed");
  assert.equal(app.state.workshopRegistration[0].paymentStatus, "completed");
  assert.equal(app.state.payment[0].notes, null);
  app.controls.failQueue = false;
  assert.equal((await app.api.recoverAdminPayment(paymentId)).success, true);
  assert.equal(app.controls.sends.length, 1);
});

test("purchase update failure never queues an invoice and can be repaired by retrying", async () => {
  const app = setup();
  app.controls.failPurchase = true;
  assert.equal((await app.api.recoverAdminPayment(paymentId)).success, false);
  assert.equal(app.controls.sends.length, 0);
  app.controls.failPurchase = false;
  assert.equal((await app.api.recoverAdminPayment(paymentId)).success, true);
});

test("membership validation failure never queues an invoice", async () => {
  const app = setup({ orderType: "product" });
  app.controls.failCard = true;
  assert.equal((await app.api.recoverAdminPayment(paymentId)).success, false);
  assert.equal(app.controls.cardCalls, 1);
  assert.equal(app.state.payment[0].status, "pending");
  assert.equal(app.controls.sends.length, 0);
});

test("lookup errors and invalid references never mutate payments", async () => {
  const app = setup();
  for (const reference of ["", "x".repeat(201), "unknown-order"])
    assert.equal((await app.api.recoverAdminPayment(reference)).success, false);
  assert.equal(app.controls.lookups, 0);
  app.controls.gateway = new Error("upstream secret response");
  const result = await app.api.inspectAdminPayment(paymentId);
  assert.equal(result.success, false);
  assert.doesNotMatch(result.message, /secret/);
  assert.equal(app.controls.sends.length, 0);
});

test("recovery page authorizes before rendering its form", async () => {
  const app = setup({ email: "rhhealthcaresimulationcenter@gmail.com" });
  const Page = load("app/admin/payment-recovery/page.tsx", {
    ...app.mocks,
    "@/components/admin/PaymentRecoveryForm": {
      PaymentRecoveryForm: () => null,
    },
  }).default;
  await assert.rejects(
    Page({ searchParams: Promise.resolve({}) }),
    /redirect:/,
  );
});

test("Payment Recovery appears in the sidebar only for full-access admins", async () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const Container = ({ children }) =>
    React.createElement("div", null, children);
  for (const email of [
    "bishnoi11011@gmail.com",
    "rhhealthcare1@gmail.com",
    "rhhealthcaresimulationcenter@gmail.com",
    null,
  ]) {
    const app = setup({ email });
    const { SidebarAdmin } = load("components/admin/SidebarAdmin.tsx", {
      ...app.mocks,
      "@/components/ui/sidebar": {
        Sidebar: Container,
        SidebarContent: Container,
        SidebarFooter: Container,
        SidebarHeader: Container,
      },
      "@/components/ui/button": { Button: Container },
      "@/app/admin/actions": { adminLogoutAction: "#logout" },
      "@/components/admin/AdminSidebarMenu": {
        AdminSidebarMenu: ({ items }) =>
          React.createElement(
            "nav",
            null,
            ...items.map((item) =>
              React.createElement(
                "a",
                { key: item.url, href: item.url },
                item.name,
              ),
            ),
          ),
      },
    });
    const html = renderToStaticMarkup(await SidebarAdmin());
    assert.equal(
      html.includes('href="/admin/payment-recovery"'),
      ["bishnoi11011@gmail.com", "rhhealthcare1@gmail.com"].includes(email),
    );
  }
});
