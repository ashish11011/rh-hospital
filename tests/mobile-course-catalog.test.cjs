const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
function load(file, mocks) {
  const exports = {};
  new Function(
    "require",
    "exports",
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
  )((id) => (id in mocks ? mocks[id] : require(id)), exports);
  return exports;
}
const policy = load("lib/courseItemAccess.ts", {});
function setup({ active = true, member = false, status = null } = {}) {
  const course = {
    id: "course-id",
    slug: "/courses/nrp",
    iosPrice: 1599,
    iosProductId: "com.rh.nrp",
    items: ["free", "free_for_members", "paid"].map((accessType) => ({
      id: accessType,
      accessType,
    })),
  };
  const tables = {
    user: { id: "id", email: "email", isActive: "isActive" },
    courseEnrolment: {
      courseId: "courseId",
      userId: "userId",
      enrolmentStatus: "enrolmentStatus",
      createdAt: "createdAt",
      id: "id",
    },
  };
  const db = {
    select: (fields) => {
      let rows = [],
        predicate;
      const query = {
        from(table) {
          rows =
            table === tables.user
              ? [{ id: "user-id", email: "user@example.com", isActive: active }]
              : status
                ? [
                    {
                      id: "new",
                      courseId: "course-id",
                      userId: "user-id",
                      enrolmentStatus: status,
                    },
                  ]
                : [];
          return query;
        },
        where(value) {
          predicate = value;
          return query;
        },
        orderBy() {
          return query;
        },
        limit() {
          return query;
        },
        then(resolve, reject) {
          return Promise.resolve(
            rows
              .filter(predicate)
              .map((row) =>
                Object.fromEntries(
                  Object.entries(fields).map(([key, column]) => [
                    key,
                    row[column],
                  ]),
                ),
              ),
          ).then(resolve, reject);
        },
      };
      return query;
    },
  };
  const helper = load("lib/mobileCourseCatalog.ts", {
    "server-only": {},
    "@/db": tables,
    "@/lib/dbConfig": { db },
    "@/lib/publicCourseData": { getPublicCourseCatalog: async () => [course] },
    "@/lib/rhIdCard": {
      getLatestUserCard: async () =>
        member
          ? {
              isActive: true,
              activationDate: new Date(Date.now() - 1000),
              validityDate: new Date(Date.now() + 10000),
            }
          : null,
    },
    "@/lib/courseItemAccess": policy,
    "drizzle-orm": {
      eq: (column, value) => (row) => row[column] === value,
      and:
        (...filters) =>
        (row) =>
          filters.every((filter) => filter(row)),
      desc: (value) => value,
    },
  });
  return (identifier = "nrp") =>
    helper.getMobileCourseCatalogDetail("USER@example.com", identifier);
}
test("mobile curriculum grants free previews and member previews independently of payment", async () => {
  const ordinary = await setup()();
  assert.deepEqual(
    ordinary.course.items.map((item) => item.canAccess),
    [true, false, false],
  );
  const member = await setup({ member: true })("course-id");
  assert.deepEqual(
    member.course.items.map((item) => item.canAccess),
    [true, true, false],
  );
  assert.equal(member.course.iosPrice, 1599);
  assert.equal(member.isEnrolled, false);
});
test("enrolled users see all lessons, while refunds do not unlock paid lessons", async () => {
  assert.deepEqual(
    (await setup({ status: "enrolled" })()).course.items.map(
      (item) => item.canAccess,
    ),
    [true, true, true],
  );
  assert.deepEqual(
    (await setup({ status: "refunded" })()).course.items.map(
      (item) => item.canAccess,
    ),
    [true, false, false],
  );
});
test("inactive accounts and unknown courses never receive preview access", async () => {
  assert.equal((await setup({ active: false })()).status, "forbidden");
  assert.equal((await setup()("missing")).status, "not_found");
});
