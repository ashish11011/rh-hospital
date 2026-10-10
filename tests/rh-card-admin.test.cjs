const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, dependencies) {
  const exports = {};
  const compiled = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  vm.runInNewContext(compiled, {
    exports,
    require: (name) => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return exports;
}

const cardId = "11111111-1111-4111-8111-111111111111";
const card = {
  id: cardId,
  fullName: "Member",
  isActive: true,
  membershipPurchaseType: "paid",
  activationDate: new Date("2026-10-10T00:00:00Z"),
  validityDate: new Date("2027-10-10T00:00:00Z"),
};

function setup({ allowed = true, total = 42, cards = [card] } = {}) {
  cards = cards.map((item) => ({ ...item }));
  const calls = [];
  const writes = [];
  const invalidations = [];
  const operators = Object.fromEntries(
    ["and", "count", "desc", "eq", "ilike", "lt", "gte", "or", "isNull"].map(
      (operator) => [operator, (...args) => ({ operator, args })],
    ),
  );
  const userCard = Object.fromEntries(
    [
      "id",
      "fullName",
      "email",
      "mobileNumber",
      "memberShipId",
      "isActive",
      "validityDate",
      "createdAt",
    ].map((field) => [field, `card.${field}`]),
  );
  const payment = Object.fromEntries(
    [
      "id",
      "orderType",
      "orderId",
      "gatewayOrderId",
      "amount",
      "amountPaid",
      "currency",
      "status",
      "createdAt",
    ].map((field) => [field, `payment.${field}`]),
  );
  const db = {
    update: (table) => ({
      set: (values) => ({
        where: async (condition) => {
          writes.push({ table, values, condition });
          const matches = (item, clause) =>
            clause.operator === "and"
              ? clause.args.every((part) => matches(item, part))
              : item[clause.args[0].split(".").pop()] === clause.args[1];
          cards
            .filter((item) => matches(item, condition))
            .forEach((item) => Object.assign(item, values));
        },
      }),
    }),
    select: (fields) => {
      const call = { fields };
      calls.push(call);
      const query = {
        from: (table) => {
          call.table = table;
          return query;
        },
        where: (condition) => {
          call.condition = condition;
          return query;
        },
        orderBy: () => query,
        limit: (limit) => {
          call.limit = limit;
          return query;
        },
        offset: (offset) => {
          call.offset = offset;
          return query;
        },
        then: (resolve, reject) =>
          Promise.resolve(
            fields?.total
              ? [{ total }]
              : call.table === userCard
                ? cards
                : [
                    {
                      id: "payment-id",
                      amount: 21,
                      amountPaid: 21,
                      createdAt: new Date("2026-10-10T00:00:00Z"),
                    },
                  ],
          ).then(resolve, reject),
      };
      return query;
    },
  };
  const dependencies = {
    "server-only": {},
    "@/lib/constants": load("lib/constants.ts", {}),
    "next/cache": { revalidatePath: (...args) => invalidations.push(args) },
    "drizzle-orm": operators,
    "@/db": { userCard, payment },
    "@/db/userSchema": { userCardSchema: userCard },
    "@/lib/dbConfig": { db },
    "@/lib/cloudfront": { cloudfrontAssetUrl: () => "" },
    "@/lib/adminAuth": {
      requireAdmin: async (access) => {
        assert.equal(access, "full");
        if (!allowed) throw new Error("Forbidden");
      },
    },
  };
  dependencies["@/lib/rhIdCard"] = load("lib/rhIdCard.ts", dependencies);
  return {
    actions: load("actions/rhCardAdminActions.ts", dependencies),
    calls,
    writes,
    cards,
    invalidations,
  };
}

test("card list and detail deny access before reading member data", async () => {
  const { actions, calls } = setup({ allowed: false });
  await assert.rejects(actions.getAdminRhCards(), /Forbidden/);
  await assert.rejects(actions.getAdminRhCard(cardId), /Forbidden/);
  await assert.rejects(actions.cancelRhCardMembership(cardId), /Forbidden/);
  assert.equal(calls.length, 0);
});

test("membership cancellation validates the card ID and rejects missing cards", async () => {
  const invalid = setup();
  const invalidResult =
    await invalid.actions.cancelRhCardMembership("invalid-id");
  assert.equal(invalidResult.success, false);
  assert.equal(invalid.calls.length, 0);
  assert.equal(invalid.writes.length, 0);
  const missing = setup({ cards: [] });
  const missingResult = await missing.actions.cancelRhCardMembership(cardId);
  assert.equal(missingResult.success, false);
  assert.equal(missing.writes.length, 0);
});

test("cancelling deactivates only the selected card and removes its discount eligibility", async () => {
  const secondCardId = "22222222-2222-4222-8222-222222222222";
  const context = setup({ cards: [card, { ...card, id: secondCardId }] });
  const constants = load("lib/constants.ts", {});
  const { isRhCardDiscountEligible } = load("lib/rhCardDiscount.ts", {
    "@/lib/constants": constants,
  });
  const now = new Date("2026-10-10T12:00:00Z");
  assert.equal(isRhCardDiscountEligible(context.cards[0], now), true);
  assert.equal(
    (await context.actions.cancelRhCardMembership(cardId)).success,
    true,
  );
  assert.equal(context.cards[0].isActive, false);
  assert.equal(isRhCardDiscountEligible(context.cards[0], now), false);
  assert.equal(context.cards[1].isActive, true);
  assert.equal(context.cards[0].validityDate, card.validityDate);
  assert.equal(context.cards[0].membershipPurchaseType, "paid");
  assert.ok(context.cards[0].updatedAt);
  assert.equal(context.writes.length, 1);
  assert.equal(context.writes[0].table.id, "card.id");
  const paths = context.invalidations.map(([pathname]) => pathname);
  for (const pathname of [
    "/admin/rh-card",
    `/admin/rh-card/${cardId}`,
    "/dashboard",
    "/courses",
  ]) {
    assert.ok(paths.includes(pathname));
  }
});

test("repeating cancellation succeeds without updating an inactive card again", async () => {
  const context = setup();
  await context.actions.cancelRhCardMembership(cardId);
  const updatedAt = context.cards[0].updatedAt;
  const result = await context.actions.cancelRhCardMembership(cardId);
  assert.equal(result.success, true);
  assert.equal(context.writes.length, 1);
  assert.equal(context.cards[0].updatedAt, updatedAt);
});

test("card list bounds pagination and applies search and expiry filters", async () => {
  const { actions, calls } = setup();
  const result = await actions.getAdminRhCards({
    page: 99,
    search: " Member ",
    status: "expired",
  });
  assert.equal(result.page, 3);
  assert.equal(result.pageCount, 3);
  assert.equal(calls[1].limit, 20);
  assert.equal(calls[1].offset, 40);
  assert.equal(result.cards[0].validityDate, "2027-10-10T00:00:00.000Z");
  const filter = JSON.stringify(calls[1].condition);
  assert.match(filter, /%Member%/);
  assert.match(filter, /card.memberShipId/);
  assert.match(filter, /card.isActive/);
  assert.match(filter, /"operator":"lt"/);
  const empty = setup({ total: 0, cards: [] });
  const emptyResult = await empty.actions.getAdminRhCards({ page: -1 });
  assert.equal(emptyResult.page, 1);
  assert.equal(emptyResult.pageCount, 1);
});

test("details reject invalid IDs and show only payments linked to the card", async () => {
  const { actions, calls } = setup();
  assert.equal(await actions.getAdminRhCard("invalid-id"), null);
  assert.equal(calls.length, 0);
  const result = await actions.getAdminRhCard(cardId);
  assert.equal(result.card.id, cardId);
  assert.equal(result.payments[0].amount, 21);
  assert.equal(result.payments[0].createdAt, "2026-10-10T00:00:00.000Z");
  const filter = JSON.stringify(calls[1].condition);
  assert.match(filter, /payment.orderType/);
  assert.match(filter, /product/);
  assert.match(filter, /payment.orderId/);
  assert.ok(filter.includes(cardId));
  const missing = setup({ cards: [] });
  assert.equal(await missing.actions.getAdminRhCard(cardId), null);
  assert.equal(missing.calls.length, 1);
});
