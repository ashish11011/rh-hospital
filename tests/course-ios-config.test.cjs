const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const exportsForConfig = {};
new Function(
  "require",
  "exports",
  ts.transpileModule(fs.readFileSync("lib/courseIosPurchase.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
)(require, exportsForConfig);
const { normalizeCourseIosPurchase } = exportsForConfig;
test("iOS configuration supports disabling sales and preserves decimal prices", () => {
  assert.deepEqual(normalizeCourseIosPurchase({}), {
    iosProductId: null,
    iosPrice: null,
  });
  assert.deepEqual(
    normalizeCourseIosPurchase({
      iosProductId: " com.rh.nrp ",
      iosPrice: 1499.99,
    }),
    { iosProductId: "com.rh.nrp", iosPrice: "1499.99" },
  );
});
test("iOS configuration rejects partial settings, invalid IDs and invalid prices", () => {
  for (const input of [
    { iosPrice: 1500 },
    { iosProductId: "product" },
    { iosProductId: "bad id", iosPrice: 10 },
    ...[-1, 0, NaN, Infinity, 12.345].map((iosPrice) => ({
      iosPrice,
      iosProductId: "com.rh.nrp",
    })),
  ]) {
    assert.throws(() => normalizeCourseIosPurchase(input));
  }
});
