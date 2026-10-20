const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function load(file, mocks = {}) {
  const exports = {};
  const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("require", "exports", compiled)((id) => {
    if (id in mocks) return mocks[id];
    if (id.startsWith("@/")) return load(`${id.slice(2)}.ts`, mocks);
    return require(id);
  }, exports);
  return exports;
}
process.env.AUTH_SECRET = "workshop-otp-tests-only";
const otp = load("lib/workshopMemberOtp.ts");
const eligible = load("lib/rhCardDiscount.ts");
const cardId = "11111111-1111-4111-8111-111111111111";
const workshopId = "22222222-2222-4222-8222-222222222222";

function setup() {
  const state = {
    card: { id: cardId, userId: "owner-1", memberShipId: "RH-NUR-2026-0001", email: "owner@example.com",
      fullName: "Card Owner", mobileNumber: "9876543210", profession: "nursing_officer", organizationName: "Hospital", city: "Jaipur",
      isActive: true, membershipPurchaseType: "paid", activationDate: new Date(Date.now() - 1000), validityDate: new Date(Date.now() + 86400000) },
    active: true, event: { id: workshopId, isCompleted: false }, challenge: null, emails: [], failEmail: false, locks: [],
  };
  const table = (name, fields) => Object.assign({ table: name }, Object.fromEntries(fields.map((key) => [key, key])));
  const userCard = table("card", ["id", "userId", "memberShipId"]);
  const user = table("user", ["id", "isActive"]);
  const workshop = table("workshop", ["id"]);
  const verification = table("verification", ["cardId", "workshopId", "challengeId"]);
  const matches = (row, predicate) => !predicate || predicate(row);
  let chain = Promise.resolve();
  const db = {
    transaction: async (fn) => {
      const before = chain;
      let release;
      chain = new Promise((resolve) => { release = resolve; });
      await before;
      const snapshot = structuredClone(state.challenge);
      try { return await fn(db); }
      catch (error) { state.challenge = snapshot; throw error; }
      finally { release(); }
    },
    select: (fields) => {
      let from, predicate;
      const query = {
        from(t) { from = t; return query; },
        innerJoin() { return query; },
        where(p) { predicate = p; return query; },
        limit() { return query; },
        for(mode) { state.locks.push([from.table, mode]); return query; },
        then(resolve, reject) {
          let rows = [];
          if (from === workshop && matches(state.event, predicate)) rows = [state.event];
          if (from === userCard && matches(state.card, predicate)) rows = fields?.card
            ? [{ card: state.card, active: state.active }] : [{ id: state.card.id }];
          if (from === verification && state.challenge && matches(state.challenge, predicate)) rows = [structuredClone(state.challenge)];
          return Promise.resolve(rows).then(resolve, reject);
        },
      };
      return query;
    },
    insert: () => ({ values: (values) => ({ onConflictDoUpdate: async () => { state.challenge = structuredClone(values); } }) }),
    update: () => ({ set: (values) => ({ where: async (predicate) => {
      if (state.challenge && matches(state.challenge, predicate)) Object.assign(state.challenge, values);
    } }) }),
  };
  const service = load("lib/workshopMember.ts", {
    "server-only": {},
    "@/db": { userCard, user, workshop, workshopMemberVerification: verification },
    "@/lib/dbConfig": { db },
    "drizzle-orm": { eq: (key, value) => (row) => row[key] === value,
      and: (...predicates) => (row) => predicates.every((predicate) => predicate(row)),
      sql: (_strings, _column, id) => (row) => row.memberShipId.toUpperCase() === id },
    "@/lib/rhCardDiscount": eligible,
    "@/lib/workshopMemberOtp": otp,
    "@/lib/sesClient": { sendWorkshopMemberOtpEmail: async (email) => {
      if (state.failEmail) throw new Error("SES failed");
      state.emails.push(email);
    } },
  });
  const send = () => service.requestWorkshopMemberOtp(" rh-nur-2026-0001 ", workshopId);
  const verify = (challengeId = state.challenge.challengeId, code = state.emails.at(-1).otp) => service.verifyWorkshopMemberOtp(challengeId, workshopId, code);
  return { state, service, send, verify };
}

test("rolling send window admits three emails including resends and releases slots at five minutes", () => {
  const now = 1_000_000;
  assert.equal(otp.getOtpSendLimit([now - 299000, now - 1000, now], now).retryAfter, 1);
  assert.equal(otp.getOtpSendLimit([now - 300000, now - 1000, now], now).retryAfter, 0);
});

test("card IDs are case insensitive and only masked email is disclosed before verification", async () => {
  const app = setup();
  const result = await app.send();
  assert.equal(result.maskedEmail, "o***@example.com");
  assert.equal(result.details, undefined);
  assert.equal(result.otp, undefined);
  assert.equal(app.state.emails[0].toEmail, "owner@example.com");
  assert.match(app.state.emails[0].otp, /^\d{6}$/);
  assert.notEqual(app.state.challenge.codeHash, app.state.emails[0].otp);
  assert.ok(app.state.locks.some(([table, mode]) => table === "card" && mode === "update"));
});

test("three concurrent sends succeed and a fourth is rate limited for the same card", async () => {
  const app = setup();
  await Promise.all([app.send(), app.send(), app.send()]);
  assert.equal(app.state.emails.length, 3);
  await assert.rejects(app.send(), (error) => error.status === 429 && error.retryAfter > 0);
  assert.equal(app.state.emails.length, 3);
  app.state.challenge.sentAt[0] = Date.now() - otp.OTP_WINDOW_MS;
  await app.send();
  assert.equal(app.state.emails.length, 4);
});

test("resending invalidates the older challenge and OTP verification can only succeed once", async () => {
  const app = setup();
  const old = await app.send();
  const oldCode = app.state.emails[0].otp;
  await app.send();
  await assert.rejects(app.verify(old.challengeId, oldCode), /expired|used/);
  const verified = await app.verify();
  assert.equal(verified.details.name, "Card Owner");
  assert.equal(verified.details.designation, "Nursing Officer");
  assert.equal(verified.details.email, "owner@example.com");
  assert.equal(app.state.challenge.codeHash, null);
  assert.notEqual(app.state.challenge.sessionHash, verified.cookie.split(".")[1]);
  await assert.rejects(app.verify(), /expired|used/);
  assert.equal((await app.service.getVerifiedWorkshopMember(verified.cookie, workshopId)).id, cardId);
});

test("incorrect OTP attempts persist and the correct code is rejected after five failures", async () => {
  const app = setup();
  await app.send();
  const wrong = app.state.emails[0].otp === "000000" ? "111111" : "000000";
  for (let i = 0; i < 5; i++) await assert.rejects(app.verify(undefined, wrong), /Incorrect/);
  assert.equal(app.state.challenge.attempts, 5);
  await assert.rejects(app.verify(), /Too many/);
});

test("expired OTPs fail before opening a verified session", async () => {
  const app = setup();
  await app.send();
  app.state.challenge.expiresAt = new Date(Date.now() - 1);
  await assert.rejects(app.verify(), /expired/);
  assert.equal(app.state.challenge.sessionHash, null);
});

test("sessions reject tampering, other workshops, expiry and revoked membership", async () => {
  const app = setup();
  await app.send();
  const { cookie } = await app.verify();
  await assert.rejects(app.service.getVerifiedWorkshopMember(undefined, workshopId), /Verify/);
  await assert.rejects(app.service.getVerifiedWorkshopMember(`${"-".repeat(36)}.${"0".repeat(64)}`, workshopId), /Verify/);
  await assert.rejects(app.service.getVerifiedWorkshopMember(`${cardId}.${"0".repeat(64)}`, workshopId), /expired/);
  await assert.rejects(app.service.getVerifiedWorkshopMember(cookie, "other-workshop"), /expired/);
  app.state.card.isActive = false;
  await assert.rejects(app.service.getVerifiedWorkshopMember(cookie, workshopId), /eligible/);
  app.state.card.isActive = true;
  const expiry = app.state.card.validityDate;
  app.state.card.validityDate = new Date(Date.now() - 1);
  await assert.rejects(app.service.getVerifiedWorkshopMember(cookie, workshopId), /eligible/);
  app.state.card.validityDate = expiry;
  app.state.card.email = "changed@example.com";
  await assert.rejects(app.service.getVerifiedWorkshopMember(cookie, workshopId), /eligible/);
  app.state.card.email = "owner@example.com";
  app.state.challenge.sessionExpiresAt = new Date(Date.now() - 1);
  await assert.rejects(app.service.getVerifiedWorkshopMember(cookie, workshopId), /expired/);
});

test("ineligible memberships and completed workshops cannot request OTPs", async () => {
  for (const change of [
    (state) => { state.card.membershipPurchaseType = "free"; },
    (state) => { state.card.isActive = false; },
    (state) => { state.card.validityDate = new Date(Date.now() - 1); },
    (state) => { state.active = false; },
    (state) => { state.event.isCompleted = true; },
  ]) {
    const app = setup();
    change(app.state);
    await assert.rejects(app.send());
    assert.equal(app.state.emails.length, 0);
  }
});

test("SES failures invalidate OTPs and still count toward the send limit", async () => {
  const app = setup();
  app.state.failEmail = true;
  await assert.rejects(app.send(), (error) => error.status === 503);
  assert.equal(app.state.challenge.codeHash, null);
  assert.equal(app.state.challenge.sentAt.length, 1);
});

test("membership changes between send and verification deny access", async () => {
  const app = setup();
  await app.send();
  app.state.card.email = "new@example.com";
  await assert.rejects(app.verify(), /changed/);
  assert.equal(app.state.challenge.sessionHash, null);
});

test("send endpoint validates IDs and passes rate-limit headers to the browser", async () => {
  const { NextRequest } = require("next/server");
  const { POST } = load("app/api/workshop/member/send-otp/route.ts", {
    "@/lib/workshopMember": {
      WorkshopMemberError: class MemberError extends Error {},
      requestWorkshopMemberOtp: async () => { throw new Error("Should not call service"); },
    },
  });
  const response = await POST(new NextRequest("https://example.com/api/workshop/member/send-otp", {
    method: "POST", body: JSON.stringify({ workshopId, registrationId: "invalid" }),
  }));
  assert.equal(response.status, 400);

  class MemberError extends Error { constructor() { super("Rate limited"); this.status = 429; this.retryAfter = 123; } }
  const limited = load("app/api/workshop/member/send-otp/route.ts", {
    "@/lib/workshopMember": { WorkshopMemberError: MemberError, requestWorkshopMemberOtp: async () => { throw new MemberError(); } },
  });
  const blocked = await limited.POST(new NextRequest("https://example.com/api/workshop/member/send-otp", {
    method: "POST", body: JSON.stringify({ workshopId, registrationId: "rh-nur-2026-0001" }),
  }));
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get("retry-after"), "123");
  assert.equal((await blocked.json()).retryAfter, 123);
});

test("verification endpoint sets an HttpOnly workshop cookie and never exposes its token in JSON", async () => {
  const { NextRequest } = require("next/server");
  const { POST } = load("app/api/workshop/member/verify-otp/route.ts", {
    "@/lib/workshopMember": {
      WorkshopMemberError: class MemberError extends Error {},
      verifyWorkshopMemberOtp: async () => ({ cookie: "opaque-token", details: { name: "Owner" } }),
    },
  });
  const response = await POST(new NextRequest("https://example.com/api/workshop/member/verify-otp", {
    method: "POST", body: JSON.stringify({ workshopId, challengeId: cardId, otp: "123456" }),
  }));
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie");
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=strict/i);
  assert.match(cookie, /Path=\/api\/workshop/);
  assert.match(cookie, /Max-Age=900/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { data: { details: { name: "Owner" }, expiresIn: 900 } });
});

test("changing workshops cannot bypass a card's rolling send limit", async () => {
  const app = setup();
  await app.send(); await app.send(); await app.send();
  app.state.event.id = "33333333-3333-4333-8333-333333333333";
  await assert.rejects(app.service.requestWorkshopMemberOtp(app.state.card.memberShipId, app.state.event.id), (error) => error.status === 429);
});

test("member OTP email uses the configured SES sender and contains the expiry", async () => {
  let message;
  const { sendWorkshopMemberOtpEmail } = load("lib/sesClient.ts", {
    "@aws-sdk/client-ses": { SendEmailCommand: class { constructor(input) { this.input = input; } } },
    "@/lib/sendLoggedEmail": { sendLoggedEmail: async (command) => { message = command.input; } },
  });
  await sendWorkshopMemberOtpEmail({ toEmail: "owner@example.com", otp: "123456" });
  assert.deepEqual(message.Destination.ToAddresses, ["owner@example.com"]);
  assert.equal(message.Source, "no-reply@rhhealthcaresimulation.com");
  assert.match(message.Message.Body.Text.Data, /123456/);
  assert.match(message.Message.Body.Text.Data, /5 minutes/);
  assert.doesNotMatch(message.Message.Subject.Data, /123456/);
});
