const { test } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function loadModule(filename) {
  const absolute = path.resolve(__dirname, "..", filename);
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function("require", "exports", source)((id) => {
    if (id.startsWith(".")) {
      return loadModule(
        path.relative(
          path.resolve(__dirname, ".."),
          path.resolve(path.dirname(absolute), `${id}.ts`),
        ),
      );
    }
    return require(id);
  }, exports);
  return exports;
}

const helpers = loadModule("helper/workshopDateTime.ts");
const { workshopSchema } = loadModule("db/workshopSchema.ts");

test("workshop schema keeps the existing UTC timestamp storage convention", () => {
  assert.equal(workshopSchema.startTime.getSQLType(), "timestamp");
  assert.equal(workshopSchema.endTime.getSQLType(), "timestamp");
});

test("IST input survives database mapping, refresh, and repeated edit/save cycles", () => {
  for (const [input, expectedUTC] of [
    ["2026-10-20T10:00", "2026-10-20T04:30:00.000Z"],
    ["2026-10-20T00:15", "2026-10-19T18:45:00.000Z"],
    ["2026-12-31T23:45", "2026-12-31T18:15:00.000Z"],
    ["2028-02-29T00:00", "2028-02-28T18:30:00.000Z"],
  ]) {
    let date = helpers.parseWorkshopInput(input);
    for (let cycle = 0; cycle < 3; cycle++) {
      assert.equal(date.toISOString(), expectedUTC);
      const serialized = workshopSchema.startTime.mapToDriverValue(date);
      // PostgreSQL's existing timestamp column returns UTC wall-clock text.
      const storedTimestamp = serialized.slice(0, -1).replace("T", " ");
      const refreshed =
        workshopSchema.startTime.mapFromDriverValue(storedTimestamp);
      assert.equal(refreshed.toISOString(), expectedUTC);
      assert.equal(helpers.formatWorkshopInput(refreshed), input);
      assert.equal(helpers.formatWorkshopInput(refreshed.toISOString()), input);
      assert.equal(helpers.formatWorkshopInput(storedTimestamp), input);
      date = helpers.parseWorkshopInput(helpers.formatWorkshopInput(refreshed));
    }
  }
});

test("admin and public formats retain the IST calendar date around UTC midnight", () => {
  const date = "2026-10-19T18:45:00.000Z";
  assert.equal(helpers.formatWorkshopDate(date), "20 Oct 2026");
  assert.equal(helpers.formatWorkshopTime(date), "12:15 am");
  assert.equal(
    helpers.formatWorkshopDateTime(date),
    "20 Oct 2026, 12:15 am IST",
  );
  assert.equal(helpers.formatWorkshopTime("2026-10-20 04:30:00"), "10:00 am");
});

test("invalid dates cannot roll into a different workshop schedule", () => {
  for (const value of [
    "",
    "2026-02-29T10:00",
    "2026-04-31T10:00",
    "2026-10-20T24:00",
    "2026-10-20T10:60",
    "2026-10-20T10:00Z",
  ]) {
    assert.throws(
      () => helpers.parseWorkshopInput(value),
      /valid workshop date and time/,
    );
  }
  assert.equal(helpers.formatWorkshopInput(null), "");
  assert.equal(helpers.formatWorkshopInput("invalid"), "");
  assert.equal(helpers.formatWorkshopDateTime("invalid"), "N/A");
});

for (const timezone of ["UTC", "Asia/Kolkata", "America/New_York"]) {
  test(`workshop entry and displays stay in IST on a ${timezone} device/server`, () => {
    const script = `
      const assert = require('node:assert/strict');
      const fs = require('node:fs');
      const ts = require('typescript');
      const helpers = {};
      const source = ts.transpileModule(fs.readFileSync('helper/workshopDateTime.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
      new Function('exports', source)(helpers);
      for (const input of ['2026-01-20T10:00', '2026-07-20T10:00', '2026-10-20T00:15']) {
        const saved = helpers.parseWorkshopInput(input);
        assert.equal(helpers.formatWorkshopInput(saved), input);
        assert.equal(helpers.parseWorkshopInput(helpers.formatWorkshopInput(saved)).getTime(), saved.getTime());
      }
      assert.equal(helpers.parseWorkshopInput('2026-10-20T10:00').toISOString(), '2026-10-20T04:30:00.000Z');
      assert.equal(helpers.formatWorkshopTime('2026-10-20T04:30:00Z'), '10:00 am');
      assert.equal(helpers.formatWorkshopDateTime('2026-10-19T18:45:00Z'), '20 Oct 2026, 12:15 am IST');
    `;
    execFileSync(process.execPath, ["-e", script], {
      cwd: path.resolve(__dirname, ".."),
      env: { ...process.env, TZ: timezone },
      stdio: "pipe",
    });
  });
}
