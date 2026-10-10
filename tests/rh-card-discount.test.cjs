const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { renderToStaticMarkup } = require("react-dom/server");

function loadModule(relativePath, dependencies = {}) {
  const exports = {};
  const source = fs.readFileSync(
    path.join(__dirname, "..", relativePath),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports,
    require: (id) => {
      assert.ok(id in dependencies, `Unexpected dependency: ${id}`);
      return dependencies[id];
    },
  });
  return exports;
}

const constants = loadModule("lib/constants.ts");
const { isRhCardDiscountEligible, getRhCardCoursePricing } = loadModule(
  "lib/rhCardDiscount.ts",
  { "@/lib/constants": constants },
);
const now = new Date("2026-10-10T12:00:00Z");
const paidCard = {
  isActive: true,
  membershipPurchaseType: "paid",
  activationDate: new Date("2026-10-01T12:00:00Z"),
  validityDate: new Date("2027-10-01T12:00:00Z"),
};

test("discount requires an active purchased card within its validity period", () => {
  assert.equal(isRhCardDiscountEligible(paidCard, now), true);
  assert.equal(isRhCardDiscountEligible(null, now), false);
  for (const membershipPurchaseType of [
    "free",
    "referred",
    "complimentary",
    "admin",
  ]) {
    assert.equal(
      isRhCardDiscountEligible({ ...paidCard, membershipPurchaseType }, now),
      false,
    );
  }
  for (const override of [
    { isActive: false },
    { activationDate: null },
    { activationDate: new Date("2026-10-11T12:00:00Z") },
    { validityDate: null },
    { validityDate: new Date("2026-10-09T12:00:00Z") },
    { validityDate: now },
    { validityDate: new Date("invalid") },
  ]) {
    assert.equal(
      isRhCardDiscountEligible({ ...paidCard, ...override }, now),
      false,
    );
  }
});

test("course pricing applies the shared 20 percent discount only to eligible users", () => {
  assert.equal(constants.RH_CARD_DISCOUNT_PERCENT, 20);
  const discounted = getRhCardCoursePricing(1000, true);
  assert.equal(discounted.originalAmount, 1000);
  assert.equal(discounted.amount, 800);
  assert.equal(discounted.discountPercent, constants.RH_CARD_DISCOUNT_PERCENT);
  const regular = getRhCardCoursePricing(1000, false);
  assert.equal(regular.amount, 1000);
  assert.equal(regular.discountPercent, 0);
});

test("discounted prices use whole rupees and free courses have no discount", () => {
  assert.equal(getRhCardCoursePricing(501, true).amount, 401);
  assert.equal(getRhCardCoursePricing(999, true).amount, 799);
  const free = getRhCardCoursePricing(0, true);
  assert.equal(free.amount, 0);
  assert.equal(free.discountPercent, 0);
});

test("course prices show the struck-through original only when discounted", () => {
  const { CoursePrice } = loadModule("components/course/CoursePrice.tsx", {
    "react/jsx-runtime": require("react/jsx-runtime"),
  });
  const renderPrice = (eligible) =>
    renderToStaticMarkup(
      CoursePrice({
        pricing: getRhCardCoursePricing(2500, eligible),
        currency: "INR",
      }),
    );
  const memberPrice = renderPrice(true);
  assert.match(memberPrice, /<s>₹2,500<\/s>/);
  assert.match(memberPrice, /₹2,000/);
  assert.match(memberPrice, /20% RH card discount applied/);
  const regularPrice = renderPrice(false);
  assert.match(regularPrice, /₹2,500/);
  assert.doesNotMatch(regularPrice, /<s>|discount applied/);
});
