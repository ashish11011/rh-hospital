const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function load(file, mocks = {}) {
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
    if (name in mocks) return mocks[name];
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`, mocks);
    return require(name);
  }, exports);
  return exports;
}

const paymentRecord = {
  id: "11111111-1111-4111-8111-111111111111",
  orderId: "22222222-2222-4222-8222-222222222222",
  orderType: "workshop",
  gatewayOrderId: "HDFC123",
  gatewayPaymentId: "PG123",
  gatewayInvoiceId: "INV123",
  modeOfPayment: "UPI",
  currency: "INR",
  amount: 800,
  amountPaid: 800,
  amountDue: 0,
  status: "completed",
  email: "member@example.com",
  contact: "9876543210",
  transactionId: "TXN123",
  createdAt: new Date("2026-10-21T04:30:00Z"),
  transactionDate: new Date("2026-10-21T04:31:00Z"),
};

function setup({
  email = "bishnoi11011@gmail.com",
  total = 42,
  records = [paymentRecord],
} = {}) {
  const queries = [];
  const payment = Object.fromEntries(
    Object.keys(paymentRecord).map((key) => [key, `payment.${key}`]),
  );
  payment.getewayPaymentId = "payment.getewayPaymentId";
  payment.orderType = {
    name: "payment.orderType",
    enumValues: ["workshop", "product", "course", "seminar"],
  };
  const operators = Object.fromEntries(
    ["and", "count", "desc", "eq", "ilike", "or", "sql"].map((operator) => [
      operator,
      (...args) => ({ operator, args }),
    ]),
  );
  const mocks = {
    "@/auth": { auth: async () => (email ? { user: { email } } : null) },
    "next/navigation": {
      redirect: (url) => {
        throw new Error(`redirect:${url}`);
      },
    },
    "@/db": { payment },
    "drizzle-orm": operators,
    "@/lib/dbConfig": {
      db: {
        select: (fields) => {
          const call = { fields };
          queries.push(call);
          const query = {
            from: () => query,
            where: (value) => {
              call.condition = value;
              return query;
            },
            orderBy: (...value) => {
              call.orderBy = value;
              return query;
            },
            limit: (value) => {
              call.limit = value;
              return query;
            },
            offset: (value) => {
              call.offset = value;
              return query;
            },
            then: (resolve, reject) =>
              Promise.resolve(fields.total ? [{ total }] : records).then(
                resolve,
                reject,
              ),
          };
          return query;
        },
      },
    },
  };
  return { mocks, queries, api: load("actions/paymentAdminActions.ts", mocks) };
}

for (const email of [
  null,
  "visitor@example.com",
  "rhhealthcaresimulationcenter@gmail.com",
]) {
  test(`payment query denies ${email || "anonymous users"} before touching the database`, async () => {
    const app = setup({ email });
    await assert.rejects(app.api.getAdminPayments(), /redirect:/);
    assert.equal(app.queries.length, 0);
  });
}

test("both full-access accounts can read payments, with ISO dates and no raw gateway payload or token", async () => {
  for (const email of ["bishnoi11011@gmail.com", "rhhealthcare1@gmail.com"]) {
    const app = setup({ email });
    const result = await app.api.getAdminPayments();
    assert.equal(result.payments[0].amount, 800);
    assert.equal(result.payments[0].createdAt, "2026-10-21T04:30:00.000Z");
    assert.equal(
      result.payments[0].transactionDate,
      "2026-10-21T04:31:00.000Z",
    );
    const selected = app.queries[1].fields;
    for (const name of [
      "tokenId",
      "responseObject",
      "cardId",
      "appleAccountToken",
    ])
      assert.equal(name in selected, false);
  }
});

test("search, case-insensitive status and order type apply to both count and rows; pages are bounded", async () => {
  const app = setup();
  const result = await app.api.getAdminPayments({
    page: 999,
    search: " Member_20% ",
    status: " CHARGED ",
    orderType: "workshop",
  });
  assert.equal(result.page, 3);
  assert.equal(result.pageCount, 3);
  assert.equal(app.queries[1].limit, 20);
  assert.equal(app.queries[1].offset, 40);
  assert.equal(app.queries[0].condition, app.queries[1].condition);
  const filter = JSON.stringify(app.queries[1].condition);
  assert.ok(filter.includes("%Member\\\\_20\\\\%%"));
  assert.match(filter, /charged/);
  assert.match(filter, /payment.orderType/);
  assert.match(filter, /payment.email/);
  assert.match(filter, /payment.contact/);
  assert.match(filter, /payment.gatewayOrderId/);
  assert.match(filter, /payment.transactionId/);
  assert.match(filter, /payment.orderId/);
  assert.match(JSON.stringify(app.queries[1].orderBy), /nulls last/);
});

test("invalid page and type values are safe and empty results remain on page one", async () => {
  for (const page of [-1, NaN, Infinity, 1.5]) {
    const app = setup({ total: 0, records: [] });
    const result = await app.api.getAdminPayments({
      page,
      orderType: "invalid",
    });
    assert.equal(result.page, 1);
    assert.equal(result.pageCount, 1);
    assert.equal(result.payments.length, 0);
    assert.equal(app.queries[1].offset, 0);
    assert.doesNotMatch(JSON.stringify(app.queries[1].condition), /invalid/);
  }
});

const primitive =
  (tag) =>
  ({ children, ...props }) =>
    React.createElement(tag, props, children);
const uiMocks = {
  "@/components/ui/sidebar": Object.fromEntries(
    ["Sidebar", "SidebarContent", "SidebarFooter", "SidebarHeader"].map(
      (name) => [name, primitive("div")],
    ),
  ),
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
  "@/components/ui/button": {
    Button: ({ children }) => React.createElement("div", null, children),
  },
  "@/components/ui/input": { Input: primitive("input") },
  "@/components/ui/badge": {
    Badge: ({ children }) => React.createElement("span", null, children),
  },
  "@/components/ui/table": Object.fromEntries(
    Object.entries({
      Table: "table",
      TableHeader: "thead",
      TableBody: "tbody",
      TableHead: "th",
      TableCell: "td",
      TableRow: "tr",
    }).map(([name, tag]) => [name, primitive(tag)]),
  ),
};

test("sidebar offers Payments only to full-access admins", async () => {
  for (const email of [
    "bishnoi11011@gmail.com",
    "rhhealthcare1@gmail.com",
    "rhhealthcaresimulationcenter@gmail.com",
    null,
  ]) {
    const app = setup({ email });
    const { SidebarAdmin } = load("components/admin/SidebarAdmin.tsx", {
      ...app.mocks,
      ...uiMocks,
      "@/app/admin/actions": { adminLogoutAction: "#logout" },
    });
    const html = renderToStaticMarkup(await SidebarAdmin());
    const full = ["bishnoi11011@gmail.com", "rhhealthcare1@gmail.com"].includes(
      email,
    );
    assert.equal(html.includes('href="/admin/payments"'), full);
  }
});

test("payments page guards access before requesting any records", async () => {
  let queried = false;
  const app = setup({ email: "rhhealthcaresimulationcenter@gmail.com" });
  const { default: Page } = load("app/admin/payments/page.tsx", {
    ...app.mocks,
    ...uiMocks,
    "@/actions/paymentAdminActions": {
      getAdminPayments: async () => {
        queried = true;
      },
    },
  });
  await assert.rejects(
    Page({ searchParams: Promise.resolve({}) }),
    /redirect:\/admin\/blog/,
  );
  assert.equal(queried, false);
});

test("payments page shows stored amounts, IST dates and preserves filters in pagination links", async () => {
  const app = setup();
  const result = await app.api.getAdminPayments({ page: 2 });
  const { default: Page } = load("app/admin/payments/page.tsx", {
    ...app.mocks,
    ...uiMocks,
    "@/actions/paymentAdminActions": { getAdminPayments: async () => result },
  });
  const html = renderToStaticMarkup(
    await Page({
      searchParams: Promise.resolve({
        search: "member@example.com",
        status: "completed",
        orderType: "workshop",
        page: "2",
      }),
    }),
  );
  assert.match(html, /member@example.com/);
  assert.match(html, /₹800/);
  assert.match(html, /₹0/);
  assert.match(html, /10:00/);
  assert.match(html, /completed/);
  assert.match(html, /Record IDs/);
  assert.match(html, /orderType=workshop/);
  assert.match(html, /status=completed/);
  assert.match(html, /search=member%40example.com/);
  assert.match(html, /page=3/);
});
