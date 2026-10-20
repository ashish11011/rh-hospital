const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function load(filename, mocks = {}) {
  const absolute = path.resolve(__dirname, "..", filename);
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  new Function("require", "exports", source)((id) => {
    if (id in mocks) return mocks[id];
    if (id.startsWith(".")) {
      return load(path.resolve(path.dirname(absolute), `${id}.ts`), mocks);
    }
    return require(id);
  }, exports);
  return exports;
}

const attendance = load("lib/workshopAttendance.ts");
const pricing = load("lib/workshopPricing.ts", { "@/lib/constants": load("lib/constants.ts") });
class WorkshopMemberError extends Error {
  constructor(message, status = 401) { super(message); this.status = status; }
}

test("workshop schema stores a required enum with both as the default", () => {
  const { workshopSchema, workshopAttendanceModeEnum: workshopAttendanceModeEnumSchema } = load(
    "db/workshopSchema.ts",
  );
  assert.deepEqual(workshopAttendanceModeEnumSchema.enumValues, [
    "online",
    "offline",
    "both",
  ]);
  assert.equal(
    workshopSchema.attendanceMode.enum.enumName,
    "workshop_attendance_mode",
  );
  assert.equal(workshopSchema.attendanceMode.notNull, true);
  assert.equal(workshopSchema.attendanceMode.default, "both");
  assert.deepEqual(attendance.getWorkshopAttendanceModes(), [
    "online",
    "offline",
  ]);
});

test("only enabled prices are validated and zero does not disable attendance", () => {
  for (const mode of ["online", "offline", "both"]) {
    assert.doesNotThrow(() =>
      attendance.validateWorkshopAttendance({
        attendanceMode: mode,
        onlinePrice: 0,
        offlinePrice: 0,
      }),
    );
  }
  for (const price of [-1, 1.5, NaN, Infinity]) {
    assert.throws(
      () =>
        attendance.validateWorkshopAttendance({
          attendanceMode: "both",
          onlinePrice: price,
          offlinePrice: 500,
        }),
      /valid.*price/,
    );
    assert.throws(
      () =>
        attendance.validateWorkshopAttendance({
          attendanceMode: "offline",
          onlinePrice: 0,
          offlinePrice: price,
        }),
      /valid.*price/,
    );
  }
  assert.throws(
    () =>
      attendance.validateWorkshopAttendance({
        attendanceMode: "invalid",
        onlinePrice: 100,
        offlinePrice: 500,
      }),
    /valid workshop attendance mode/,
  );
  assert.doesNotThrow(() =>
    attendance.validateWorkshopAttendance({
      attendanceMode: "offline",
      onlinePrice: -1,
      offlinePrice: 500,
    }),
  );
});

function setup(attendanceMode, memberCard = null) {
  const workshop = { id: "workshop.id" };
  const user = { id: "user.id", email: "user.email" };
  const registrationTable = {};
  const payment = {};
  const saved = [];
  const sessions = [];
  const workshopRecord = {
    id: "workshop-1",
    attendanceMode,
    onlinePrice: 100,
    offlinePrice: 500,
  };
  const db = {
    select: () => ({
      from: (table) => ({
        where: async () =>
          table === workshop ? [workshopRecord] : [{ id: "user-1" }],
      }),
    }),
    insert: (table) => ({
      values: (data) => {
        saved.push({ table, data });
        return { returning: async () => [{ id: "registration-1" }] };
      },
    }),
  };
  const { POST } = load("app/api/workshop/register/route.ts", {
    "@/db": {
      workshop,
      user,
      workshopRegistration: registrationTable,
      payment,
    },
    "@/db/userSchema": { userSchema: user },
    "@/lib/dbConfig": { db },
    "drizzle-orm": { eq: () => ({}) },
    "next/navigation": {
      notFound: () => {
        throw new Error("Not found");
      },
    },
    "next/server": {
      NextResponse: { json: (body, init) => Response.json(body, init) },
    },
    "@/helper/workshop/getCouponCodeDetails": {
      getCouponCodeDetails: async () => ({
        onlineDiscount: 10,
        offlineDiscount: 50,
      }),
    },
    "@/lib/workshopAttendance": attendance,
    "@/lib/workshopPricing": pricing,
    "@/lib/workshopMemberOtp": { memberCookieName: () => "member" },
    "@/lib/workshopMember": {
      WorkshopMemberError,
      getVerifiedWorkshopMember: async (cookie) => {
        if (!memberCard || cookie !== "valid") throw new WorkshopMemberError("Verify membership first.");
        return memberCard;
      },
      workshopMemberDetails: (card) => card.details,
    },
    "@/lib/hdfcGateway": {
      createHdfcCustomerId: () => "customer-1",
      createHdfcGatewayOrderId: () => "order-1",
      createHdfcPaymentSession: async (input) => {
        sessions.push(input);
        return {
          id: "session-1",
          status: "pending",
          payment_links: { web: "https://checkout.example.com" },
        };
      },
    },
  });
  return {
    saved,
    sessions,
    async register(mode, couponCode, overrides = {}, cookie) {
      return POST({
        cookies: { get: () => cookie ? { value: cookie } : undefined },
        json: async () => ({
          workshopId: "workshop-1",
          email: "test@example.com",
          name: "Test User",
          mobileNumber: "9876543210",
          designation: "Nurse",
          instituteName: "Hospital",
          city: "Jaipur",
          modeOfAttandnace: mode,
          couponCode,
          ...overrides,
        }),
      });
    },
  };
}

for (const mode of ["online", "offline", "both"]) {
  for (const registrationMode of ["online", "offline", "both", "invalid"]) {
    test(`${mode} workshop ${attendance.isWorkshopRegistrationAllowed(mode, registrationMode) ? "accepts" : "rejects"} ${registrationMode} registration`, async () => {
      const app = setup(mode);
      const response = await app.register(registrationMode);
      const allowed =
        registrationMode !== "both" &&
        registrationMode !== "invalid" &&
        (mode === "both" || mode === registrationMode);
      assert.equal(response.status, allowed ? 200 : 400);
      if (!allowed) {
        assert.match((await response.json()).message, /not available/);
        assert.equal(
          app.saved.length,
          0,
          "reject before any user, registration, or payment write",
        );
        assert.equal(app.sessions.length, 0, "reject before starting payment");
      } else {
        assert.equal(app.saved[0].data.modeOfAttandnace, registrationMode);
        assert.equal(
          app.sessions[0].amount,
          registrationMode === "online" ? 100 : 500,
        );
        assert.equal(app.saved[1].data.amount, app.sessions[0].amount);
      }
    });
  }
}

test("offline-only registration retains offline pricing and coupon discount", async () => {
  const app = setup("offline");
  const response = await app.register("offline", "DISCOUNT");
  assert.equal(response.status, 200);
  assert.equal(app.saved[0].data.workshopAmount, 500);
  assert.equal(app.saved[0].data.couponDiscount, 50);
  assert.equal(app.sessions[0].amount, 450);
});

test("registration form shows and preselects only available attendance modes", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const element =
    (tag) =>
    ({ children }) =>
      React.createElement(tag, null, children);
  let selection;
  const { WorkshopRegistration } = load(
    "components/workshop/takeRegistratoinDialog.tsx",
    {
      "@/lib/workshopAttendance": attendance,
      "@/lib/workshopPricing": pricing,
      "./MemberWorkshopVerification": { MemberWorkshopVerification: () => null },
      "@/components/ui/input": { Input: () => null },
      "@/components/ui/label": { Label: element("label") },
      "@/components/ui/button": { Button: element("button") },
      "@/components/ui/checkbox": { Checkbox: () => null },
      "@/components/custom-radio-group": {
        CustomRadioGroup: (props) => {
          selection = props;
          return null;
        },
      },
      "../ui/input-group": {
        InputGroup: element("div"),
        InputGroupAddon: element("div"),
        InputGroupButton: element("button"),
        InputGroupInput: () => null,
      },
      "./sourceOfRegistration": { SourceOfRegistraion: () => null },
      "@/const/workshopRegistration": load("const/workshopRegistration.ts"),
      "next/navigation": { useSearchParams: () => new URLSearchParams() },
      sonner: { toast: {} },
    },
  );
  for (const [mode, expected] of [
    ["online", ["online"]],
    ["offline", ["offline"]],
    ["both", ["online", "offline"]],
  ]) {
    renderToStaticMarkup(
      React.createElement(WorkshopRegistration, {
        workshopId: "workshop-1",
        attendanceMode: mode,
        priceOnline: 100,
        priceOffline: 500,
      }),
    );
    assert.deepEqual(
      selection.options.map((option) => option.value),
      expected,
    );
    assert.equal(selection.value, expected[0]);
  }
});

const memberCard = {
  id: "card-1", userId: "card-owner", memberShipId: "RH-NUR-2026-0001",
  details: { email: "owner@example.com", name: "Card Owner", mobileNumber: "9999999999", designation: "Nursing Officer", instituteName: "Card Hospital", city: "Jaipur" },
};

test("verified membership uses server card details and charges 80% of the selected workshop price", async () => {
  for (const [mode, amount] of [["online", 80], ["offline", 400]]) {
    const app = setup("both", memberCard);
    const response = await app.register(mode, undefined, {
      registrationType: "member", name: "Attacker", email: "attacker@example.com", amount: 1,
      memberDiscount: 499, payableAmount: 1,
    }, "valid");
    assert.equal(response.status, 200);
    assert.equal(app.sessions[0].amount, amount);
    assert.equal(app.sessions[0].customerEmail, memberCard.details.email);
    assert.equal(app.saved[0].data.userId, "card-owner");
    assert.equal(app.saved[0].data.name, "Card Owner");
    assert.equal(app.saved[0].data.instituteName, "Card Hospital");
    assert.equal(app.saved[0].data.couponDiscount, 0);
    assert.equal(app.saved[0].data.payableAmount, amount);
    const notes = JSON.parse(app.saved[1].data.notes);
    assert.equal(notes.memberDiscount, mode === "online" ? 20 : 100);
    assert.equal(notes.rhCardId, "card-1");
    assert.equal(app.saved[1].data.amount, amount);
  }
});

test("unverified member cannot create a registration or payment", async () => {
  const app = setup("both", memberCard);
  const response = await app.register("online", undefined, { registrationType: "member" });
  assert.equal(response.status, 401);
  assert.equal(app.saved.length, 0);
  assert.equal(app.sessions.length, 0);
});

test("member discount cannot stack with a coupon", async () => {
  const app = setup("both", memberCard);
  const response = await app.register("online", "COUPON", { registrationType: "member" }, "valid");
  assert.equal(response.status, 400);
  assert.equal(app.saved.length, 0);
});

test("regular users cannot claim a member discount through request fields", async () => {
  const app = setup("both", memberCard);
  const response = await app.register("offline", undefined, { memberDiscount: 100, rhCardId: "card-1", payableAmount: 1 }, "valid");
  assert.equal(response.status, 200);
  assert.equal(app.sessions[0].amount, 500);
  assert.equal(JSON.parse(app.saved[1].data.notes).memberDiscount, 0);
});

test("membership pricing uses whole rupees and ignores coupon values", () => {
  assert.deepEqual(pricing.getWorkshopPricing(501, true, 400), { amount: 401, memberDiscount: 100, couponDiscount: 0 });
  assert.deepEqual(pricing.getWorkshopPricing(999, true), { amount: 799, memberDiscount: 200, couponDiscount: 0 });
});
