const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const orm = require("drizzle-orm");
const { pgTable, uuid, integer, PgDialect } = require("drizzle-orm/pg-core");

function load(file, mocks) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    },
  ).outputText;
  new Function("require", "exports", code)((name) => {
    if (name in require("./helpers/logging.cjs"))
      return require("./helpers/logging.cjs")[name];
    if (name in mocks) return mocks[name];
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`, mocks);
    return require(name);
  }, exports);
  return exports;
}

const courseId = "10000000-0000-4000-8000-000000000001";
const ids = [1, 2, 3].map((n) => `20000000-0000-4000-8000-00000000000${n}`);
const course = pgTable("course", { id: uuid("id") });
const courseItem = pgTable("course_item", {
  id: uuid("id"),
  courseId: uuid("course_id"),
  priority: integer("priority"),
});
const dialect = new PgDialect();

function server({
  allowed = true,
  existingIds = ids,
  courseExists = true,
  failUpdate = false,
} = {}) {
  const updates = [],
    invalidations = [],
    reads = [];
  let transactions = 0;
  const db = {
    async transaction(callback) {
      transactions++;
      const pending = [];
      await callback({
        select: () => {
          let table, filter;
          const query = {
            from: (value) => {
              table = value;
              return query;
            },
            where: (value) => {
              filter = value;
              return query;
            },
            orderBy: () => query,
            for: async (lock) => {
              reads.push({ table, filter: dialect.sqlToQuery(filter), lock });
              return table === course
                ? courseExists
                  ? [{ id: courseId }]
                  : []
                : existingIds.map((id) => ({ id }));
            },
          };
          return query;
        },
        update: (table) => ({
          set: (data) => ({
            where: async (filter) => {
              if (failUpdate) throw new Error("Database unavailable");
              pending.push({ table, data, filter: dialect.sqlToQuery(filter) });
            },
          }),
        }),
      });
      updates.push(...pending);
    },
  };
  const actions = load("actions/courseAdminActions.ts", {
    "@/db": { course, courseItem },
    "@/lib/dbConfig": { db },
    "@/lib/adminAuth": {
      requireAdmin: async (permission) => {
        assert.equal(permission, "full");
        if (!allowed) throw new Error("Forbidden");
      },
    },
    "next/cache": { revalidatePath: (...args) => invalidations.push(args) },
    "@/lib/publicAsset": {},
    "@/lib/course": {},
    "@/lib/courseItemAccess": {},
  });
  return {
    updates,
    invalidations,
    reads,
    transactions: () => transactions,
    save: (order, id = courseId) => actions.reorderCourseItems(id, order),
  };
}

test("course order is written atomically in one course-scoped update with sequential priorities", async () => {
  const app = server();
  await app.save([ids[2], ids[0], ids[1]]);
  assert.equal(app.transactions(), 1);
  assert.equal(app.updates.length, 1);
  assert.equal(app.updates[0].table, courseItem);
  assert.deepEqual(app.updates[0].filter.params, [courseId]);
  assert.match(app.updates[0].filter.sql, /course_id/);
  const priorities = dialect.sqlToQuery(app.updates[0].data.priority);
  assert.deepEqual(priorities.params, [ids[2], 1, ids[0], 2, ids[1], 3]);
  assert.deepEqual(
    app.reads.map((read) => read.lock),
    ["update", "update"],
  );
  assert.ok(app.invalidations.some(([route]) => route === "/courses/[slug]"));
  assert.ok(
    app.invalidations.some(
      ([route]) => route === `/dashboard/courses/${courseId}`,
    ),
  );
});

test("unauthorized and invalid reorder requests never open a database transaction", async () => {
  const denied = server({ allowed: false });
  await assert.rejects(denied.save(ids), /Forbidden/);
  assert.equal(denied.transactions(), 0);
  for (const order of [[], [ids[0], ids[0]], ["invalid-id"], null]) {
    const app = server();
    await assert.rejects(app.save(order));
    assert.equal(app.transactions(), 0);
    assert.equal(app.updates.length, 0);
  }
});

test("stale, incomplete and cross-course item lists leave all priorities unchanged", async () => {
  for (const order of [
    [ids[0]],
    [...ids, "30000000-0000-4000-8000-000000000001"],
    [ids[0], ids[1], "30000000-0000-4000-8000-000000000001"],
  ]) {
    const app = server();
    await assert.rejects(app.save(order), /Course items have changed/);
    assert.equal(app.updates.length, 0);
    assert.equal(app.invalidations.length, 0);
  }
});

test("missing courses and database failures cannot report a saved order", async () => {
  for (const options of [{ courseExists: false }, { failUpdate: true }]) {
    const app = server(options);
    await assert.rejects(app.save(ids));
    assert.equal(app.updates.length, 0);
    assert.equal(app.invalidations.length, 0);
  }
});

function ui({ failure = false } = {}) {
  let cursor = 0;
  const states = [],
    saves = [];
  let items = ids.map((id, index) => ({
    id,
    courseId,
    title: `Lesson ${index + 1}`,
    mediaType: "video",
    mediaUrl: `course/${index}.mp4`,
    priority: index + 1,
  }));
  const mocks = {
    react: {
      ...React,
      useState(initial) {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [
          states[index],
          (value) => {
            states[index] =
              typeof value === "function" ? value(states[index]) : value;
          },
        ];
      },
    },
    "motion/react": {
      Reorder: { Group: "ReorderGroup", Item: "ReorderItem" },
      useDragControls: () => ({ start() {} }),
    },
    "@/actions/courseAdminActions": {
      reorderCourseItems: async (id, order) => {
        saves.push([id, order]);
        if (failure) throw new Error("Unable to save order");
        items = order.map((itemId, index) => ({
          ...items.find((item) => item.id === itemId),
          priority: index + 1,
        }));
      },
    },
    "@/components/course/CourseItemBanner": { CourseItemBanner: "Banner" },
    "@/lib/cloudfront": {},
    "@/lib/publicAsset": { isCourseVideoMedia: () => true },
    "./CourseMediaPreview": { CourseMediaPreview: "Preview" },
    "@/lib/courseItemAccess": { COURSE_ITEM_ACCESS_LABELS: { paid: "Paid" } },
  };
  for (const [module, names] of Object.entries({
    button: ["Button"],
    dialog: [
      "Dialog",
      "DialogContent",
      "DialogDescription",
      "DialogHeader",
      "DialogTitle",
    ],
    input: ["Input"],
    label: ["Label"],
    select: [
      "Select",
      "SelectContent",
      "SelectItem",
      "SelectTrigger",
      "SelectValue",
    ],
    table: [
      "Table",
      "TableBody",
      "TableCell",
      "TableHead",
      "TableHeader",
      "TableRow",
    ],
  })) {
    mocks[`@/components/ui/${module}`] = Object.fromEntries(
      names.map((name) => [name, name]),
    );
  }
  const Component = load(
    "components/admin/CourseItemsManager.tsx",
    mocks,
  ).CourseItemsManager;
  function elements(type) {
    cursor = 0;
    const found = [];
    function visit(node) {
      if (!React.isValidElement(node)) return;
      if (
        typeof node.type === "function" &&
        node.type.name === "SortableCourseItemRow"
      ) {
        visit(node.type(node.props));
        return;
      }
      if (node.type === type) found.push(node);
      React.Children.forEach(node.props.children, visit);
    }
    visit(Component({ courseId, items, email: "admin@example.com" }));
    return found;
  }
  return {
    saves,
    elements,
    order: () => elements("ReorderGroup")[0].props.values,
    drag: (order) => elements("ReorderGroup")[0].props.onReorder(order),
    click: (label) =>
      elements("Button")
        .find((node) => node.props.children === label)
        .props.onClick(),
  };
}

test("dragging previews the order and Save order persists the full sequence", async () => {
  const app = ui();
  const order = [ids[2], ids[0], ids[1]];
  app.drag(order);
  assert.deepEqual(app.order(), order);
  assert.equal(app.saves.length, 0);
  assert.equal(app.elements("Button")[0].props.disabled, true);
  await app.click("Save order");
  assert.deepEqual(app.saves, [[courseId, order]]);
  assert.deepEqual(app.order(), order);
  assert.equal(app.elements("Button")[0].props.disabled, false);
});

test("keyboard handles support reordering and Reset order restores the saved sequence", () => {
  const app = ui();
  app
    .elements("button")[2]
    .props.onKeyDown({ key: "ArrowUp", preventDefault() {} });
  assert.deepEqual(app.order(), [ids[0], ids[2], ids[1]]);
  app.click("Reset order");
  assert.deepEqual(app.order(), ids);
});

test("failed saves retain the chosen order and show an error for retry", async () => {
  const app = ui({ failure: true });
  const order = [ids[2], ids[1], ids[0]];
  app.drag(order);
  await app.click("Save order");
  assert.deepEqual(app.order(), order);
  assert.equal(
    app.elements("p").find((node) => node.props.role === "alert").props
      .children,
    "Unable to save order",
  );
  assert.equal(
    app.elements("Button").find((node) => node.props.children === "Save order")
      .props.disabled,
    false,
  );
});
