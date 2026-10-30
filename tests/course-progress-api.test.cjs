const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

function setup({
  accessType = "paid",
  existing = null,
  authenticated = true,
} = {}) {
  const writes = [];
  const results = [
    [{ id: "user" }],
    [{ id: "course" }],
    [{ id: "enrolment", status: "enrolled" }],
    [{ id: "item", accessType }],
    existing ? [existing] : [],
  ];
  let reads = 0;
  const db = {
    select: () => {
      const value = results[reads++];
      const chain = {
        from: () => chain,
        where: () => chain,
        orderBy: () => chain,
        limit: () => chain,
        then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
      };
      return chain;
    },
    insert: () => ({
      values: (value) => {
        writes.push(["insert", value]);
        return { returning: async () => [{ id: "progress", ...value }] };
      },
    }),
    update: () => ({
      set: (value) => {
        writes.push(["update", value]);
        return {
          where: () => ({
            returning: async () => [{ id: "progress", ...value }],
          }),
        };
      },
    }),
  };
  const dependencies = {
    "@/lib/logging/api": { withApiLogging: (_route, fn) => fn },
    "@/db": {
      course: {},
      courseEnrolment: {},
      courseItem: {},
      lessonProgress: {},
      user: {},
    },
    "@/lib/dbConfig": { db },
    "@/lib/mobileApiAuth": {
      getAuthenticatedApiEmail: async () =>
        authenticated ? "user@example.com" : null,
    },
    "drizzle-orm": { and() {}, desc() {}, eq() {}, or() {} },
    "next/server": { NextResponse: { json: Response.json } },
  };
  const exports = {};
  new Function(
    "require",
    "exports",
    ts.transpileModule(
      fs.readFileSync(
        "app/api/auth/mobile/courses/[courseId]/progress/route.ts",
        "utf8",
      ),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
  )((id) => {
    assert.ok(id in dependencies, id);
    return dependencies[id];
  }, exports);
  return {
    writes,
    reads: () => reads,
    run: (body = {}) =>
      exports.POST(
        new Request("https://example.com/api", {
          method: "POST",
          body: JSON.stringify({
            courseItemId: "item",
            progress: 95,
            duration: 100,
            ...body,
          }),
        }),
        { params: Promise.resolve({ courseId: "course" }) },
      ),
  };
}

test("free and RH-member lessons never read or write stored progress, even when enrolled", async () => {
  for (const accessType of ["free", "free_for_members"]) {
    const app = setup({
      accessType,
      existing: { id: "old-progress", isCompleted: true },
    });
    const response = await app.run({ accessType: "paid" });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      success: true,
      tracked: false,
      progress: null,
    });
    assert.equal(app.reads(), 4);
    assert.deepEqual(app.writes, []);
  }
});
test("paid lessons still insert and update progress and preserve completion", async () => {
  const fresh = setup();
  assert.equal((await fresh.run()).status, 201);
  assert.equal(fresh.writes[0][0], "insert");
  assert.equal(fresh.writes[0][1].progress, 95);
  assert.equal(fresh.writes[0][1].isCompleted, true);
  const completed = setup({ existing: { id: "progress", isCompleted: true } });
  assert.equal((await completed.run({ progress: 20 })).status, 200);
  assert.equal(completed.writes[0][0], "update");
  assert.equal(completed.writes[0][1].isCompleted, true);
});
test("unauthenticated progress requests cause no database operations", async () => {
  const app = setup({ authenticated: false });
  assert.equal((await app.run()).status, 401);
  assert.equal(app.reads(), 0);
  assert.deepEqual(app.writes, []);
});
