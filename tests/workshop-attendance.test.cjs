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

test("workshop schema stores a required enum with both as the default", () => {
  const { workshopSchema, workshopAttendanceModeEnumSchema } = load(
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

function setup(attendanceMode) {
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
    async register(mode, couponCode) {
      return POST({
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
