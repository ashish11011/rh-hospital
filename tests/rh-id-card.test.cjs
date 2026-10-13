const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const account = {
  id: "website-user",
  email: "member@example.com",
  name: "RH Member",
  mobileNumber: "9876543210",
  city: "Jaipur",
  instituteName: "RH Hospital",
};
const card = {
  id: "existing-card",
  userId: account.id,
  memberShipNumber: 42,
  memberShipId: "RH-NUR-2026-0042",
  fullName: "RH Member",
  profession: "nursing_officer",
  passportPhoto: "membership-cards/website-user/photo.jpg",
  dateOfBirth: new Date("1995-01-01T00:00:00Z"),
  activationDate: new Date("2026-10-07T00:00:00Z"),
  validityDate: new Date("2028-10-07T00:00:00Z"),
  createdAt: new Date("2026-10-07T00:00:00Z"),
  updatedAt: new Date("2026-10-07T00:00:00Z"),
};
const validInput = {
  fullName: "Website Member",
  mobileNumber: "9876543210",
  gender: "female",
  dateOfBirth: "1995-01-01",
  state: "Rajasthan",
  city: "Jaipur",
  profession: "nursing_officer",
  qualification: "bsc_nursing",
  passportPhoto: "membership-cards/website-user/photo.jpg",
  termsAccepted: true,
};

function setup({ authenticated = true, existing = null } = {}) {
  const writes = [];
  const filters = [];
  const user = { email: "user.email" };
  const userCard = {
    userId: "card.userId",
    id: "card.id",
    createdAt: "card.createdAt",
  };
  const db = {
    select: () => ({
      from: (table) => {
        const rows = table === user ? [account] : existing ? [existing] : [];
        const query = {
          where: (filter) => {
            filters.push(filter);
            return query;
          },
          orderBy: () => query,
          limit: async () => rows,
        };
        return query;
      },
    }),
    insert: () => ({
      values: (values) => {
        writes.push(values);
        return {
          returning: async () => [{ ...card, ...values, memberShipId: null }],
        };
      },
    }),
    update: () => ({
      set: (values) => ({
        where: () => ({ returning: async () => [{ ...card, ...values }] }),
      }),
    }),
  };
  const dependencies = {
    "server-only": {},
    "@/lib/constants": { RH_CARD_OTHER_PROFESSION_MAX_LENGTH: 120 },
    "next/server": {
      NextResponse: {
        json: (body, options) => ({ body, status: options?.status || 200 }),
      },
    },
    "drizzle-orm": {
      eq: (field, value) => ({ field, value }),
      desc: (field) => field,
    },
    "@/db/userSchema": { userSchema: user, userCardSchema: userCard },
    "@/lib/publicAsset": {
      publicAssetUrl: (key) =>
        key ? `https://images.example.com/public/${key.replace(/^public\//, "")}` : "",
      isMembershipPhotoKey: (key, id) => Boolean(key?.replace(/^public\//, "").startsWith(`membership-cards/${id}/`)),
    },
    "@/lib/dbConfig": { db },
    "@/lib/mobileApiAuth": {
      getAuthenticatedApiEmail: async (req) => {
        assert.equal(
          req.headers.get("authorization"),
          null,
          "Website requests should use their session",
        );
        return authenticated ? account.email : null;
      },
    },
  };
  const cardHelpers = {};
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync(path.join(__dirname, "../lib/rhIdCard.ts"), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
    {
      exports: cardHelpers,
      Date,
      require: (id) => {
        assert.ok(dependencies[id], `Unexpected dependency: ${id}`);
        return dependencies[id];
      },
    },
  );
  dependencies["@/lib/rhIdCard"] = cardHelpers;
  dependencies["@/lib/rhIdCardPayment"] = {
    RH_ID_CARD_AMOUNT_INR: 501,
    getRhCardPendingPurchase: async () => null,
    startRhCardPurchase: async (signedInAccount, details) => {
      writes.push({
        userId: signedInAccount.id,
        email: signedInAccount.email,
        details,
      });
      return {
        card: null,
        purchase: {
          orderId: "RHC123",
          amount: 501,
          currency: "INR",
          status: "pending",
          paymentUrl: "https://checkout.example.com/order",
          expiresAt: "2028-01-01",
        },
      };
    },
  };
  const exports = {};
  const source = fs.readFileSync(
    path.join(__dirname, "../app/api/auth/mobile/id-card/route.ts"),
    "utf8",
  );
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      Date,
      require: (id) => {
        assert.ok(dependencies[id], `Unexpected dependency: ${id}`);
        return dependencies[id];
      },
    },
  );
  return {
    writes,
    filters,
    get: () =>
      exports.GET(new Request("https://example.com/api/auth/mobile/id-card")),
    post: (body = validInput) =>
      exports.POST(
        new Request("https://example.com/api/auth/mobile/id-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
      ),
  };
}

test("unauthenticated website requests cannot read or create RH cards", async () => {
  const api = setup({ authenticated: false });
  assert.equal((await api.get()).status, 401);
  assert.equal((await api.post()).status, 401);
  assert.equal(api.writes.length, 0);
  assert.equal(api.filters.length, 0);
});

test("a website user with no card gets profile defaults for the creation form", async () => {
  const api = setup();
  const result = await api.get();
  assert.equal(result.body.card, null);
  assert.equal(result.body.defaults.email, account.email);
  assert.equal(result.body.defaults.organizationName, account.instituteName);
  assert.equal(api.filters.at(-1).value, account.id);
});

test("the dashboard receives the existing mobile card and its photo", async () => {
  const result = await setup({ existing: card }).get();
  assert.equal(result.body.card.memberShipId, card.memberShipId);
  assert.equal(result.body.card.dateOfBirth, "1995-01-01T00:00:00.000Z");
  assert.equal(
    result.body.card.passportPhotoUrl,
    `https://images.example.com/public/${card.passportPhoto}`,
  );
});

test("creating when a card already exists returns that card without a second insert", async () => {
  const api = setup({ existing: card });
  const result = await api.post();
  assert.equal(result.status, 200);
  assert.equal(result.body.card.id, card.id);
  assert.equal(api.writes.length, 0);
});

test("checkout uses the signed-in account and ignores a client-supplied price without creating a card", async () => {
  const api = setup();
  const result = await api.post({
    ...validInput,
    userId: "other-user",
    email: "other@example.com",
    amount: 1,
  });
  assert.equal(result.status, 200);
  assert.equal(api.writes[0].userId, account.id);
  assert.equal(api.writes[0].email, account.email);
  assert.equal(result.body.card, null);
  assert.equal(result.body.paymentRequired, true);
  assert.equal(result.body.data.amount, 501);
  assert.equal(
    result.body.data.paymentUrl,
    "https://checkout.example.com/order",
  );
  assert.equal(api.writes[0].details.amount, undefined);
});

test("another user's uploaded photo cannot be used on a website card", async () => {
  const api = setup();
  const result = await api.post({
    ...validInput,
    passportPhoto: "membership-cards/other-user/photo.jpg",
  });
  assert.equal(result.status, 400);
  assert.equal(api.writes.length, 0);
});

test("required membership details and acceptance are validated on the server", async () => {
  for (const invalid of [
    { fullName: " " },
    { gender: "unknown" },
    { profession: "unknown" },
    { termsAccepted: false },
    { dateOfBirth: "2025-02-30" },
    { passportPhoto: "" },
  ]) {
    const api = setup();
    assert.equal((await api.post({ ...validInput, ...invalid })).status, 400);
    assert.equal(api.writes.length, 0);
  }
});
