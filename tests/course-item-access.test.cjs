const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function load(file, mocks = {}) {
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
  new Function("require", "exports", code)(
    (name) => (name in mocks ? mocks[name] : require(name)),
    exports,
  );
  return exports;
}

const policy = load("lib/courseItemAccess.ts");
const mocks = {
  "next/navigation": { useRouter: () => ({ push() {} }) },
  "next/link": {
    __esModule: true,
    default: ({ children, href }) =>
      React.createElement("a", { href }, children),
  },
  "@/components/ui/badge": {
    Badge: ({ children, className }) =>
      React.createElement(
        "span",
        { "data-access-badge": true, className },
        children,
      ),
  },
  "@/components/ui/button": {
    Button: ({ children, asChild, ...props }) =>
      asChild ? children : React.createElement("button", props, children),
  },
  "@/components/ui/dialog": {
    Dialog: ({ open, children }) =>
      open
        ? React.createElement("section", { role: "dialog" }, children)
        : null,
    DialogContent: ({ children }) => React.createElement("div", null, children),
    DialogHeader: ({ children }) =>
      React.createElement("header", null, children),
    DialogTitle: ({ children }) => React.createElement("h2", null, children),
    DialogDescription: ({ children }) =>
      React.createElement("p", null, children),
  },
  "@/lib/courseItemAccess": policy,
  "./SignedCourseVideo": { __esModule: true, default: () => null },
};
const Curriculum = load(
  "components/course/CourseCurriculum.tsx",
  mocks,
).default;

function props(accessTypes, options = {}) {
  const { email = "", isEnrolled = false, isMember = false } = options;
  return {
    courseId: "course",
    coursePath: "/courses/test",
    email,
    items: accessTypes.map((accessType, index) => ({
      id: `item-${index}`,
      moduleNumber: index + 1,
      lectureName: `Lesson ${index + 1}`,
      duration: "12:00",
      mediaType: options.isVideo === false ? "document" : "video",
      isVideo: options.isVideo !== false,
      accessType,
      canAccess: policy.canAccessCourseItem(accessType, {
        isLoggedIn: Boolean(email),
        isEnrolled,
        isMember,
      }),
    })),
  };
}

function render(accessTypes, options) {
  return renderToStaticMarkup(
    React.createElement(Curriculum, props(accessTypes, options)),
  );
}

test("guests see clickable lesson titles with green Free and Members only badges", () => {
  const html = render(["free", "free_for_members", "paid"]);
  assert.equal((html.match(/<button/g) || []).length, 2);
  assert.doesNotMatch(
    html,
    /Watch lesson|Open resource|Sign in|Get membership|href="\/sign-in/,
  );
  assert.match(
    html,
    /data-access-badge="true" class="[^"]*text-emerald-700[^"]*">Free</,
  );
  assert.match(html, /data-access-badge="true">Members only</);
  assert.doesNotMatch(html, /data-access-badge="true">Paid</);
});

test("logged-in users can open free lessons without enrollment or membership", () => {
  const html = render(["free", "free_for_members", "paid"], {
    email: "learner@example.com",
  });
  assert.equal((html.match(/<button/g) || []).length, 2);
  assert.doesNotMatch(html, /Get membership|RH membership required/);
});

test("enrollment opens free, member and paid lessons without requiring membership", () => {
  const html = render(["free", "free_for_members", "paid"], {
    email: "learner@example.com",
    isEnrolled: true,
  });
  assert.equal((html.match(/<button/g) || []).length, 3);
  assert.doesNotMatch(html, /Get membership|Sign in/);
});

function interactive(accessTypes, options = {}) {
  let cursor = 0;
  const states = [],
    routes = [];
  const Component = load("components/course/CourseCurriculum.tsx", {
    ...mocks,
    react: {
      ...React,
      useState(initial) {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [
          states[index],
          (value) => {
            states[index] = value;
          },
        ];
      },
    },
    "next/navigation": {
      useRouter: () => ({ push: (href) => routes.push(href) }),
    },
  }).default;
  function elements(type) {
    cursor = 0;
    const found = [];
    function visit(node) {
      if (!React.isValidElement(node)) return;
      if (
        node.type === mocks["@/components/ui/dialog"].Dialog &&
        !node.props.open
      )
        return;
      if (node.type === type) found.push(node);
      React.Children.forEach(node.props.children, visit);
    }
    visit(Component(props(accessTypes, options)));
    return found;
  }
  return {
    routes,
    click: () => elements("button")[0].props.onClick(),
    dialogs: () => elements(mocks["@/components/ui/dialog"].Dialog),
    descriptions: () =>
      elements(mocks["@/components/ui/dialog"].DialogDescription),
    links: () => elements(mocks["next/link"].default),
    videos: () => elements(mocks["./SignedCourseVideo"].default),
  };
}

test("guest clicks on free and member videos or resources redirect to login with the course return URL", () => {
  for (const accessType of ["free", "free_for_members"]) {
    for (const isVideo of [true, false]) {
      const app = interactive([accessType], { isVideo });
      assert.deepEqual(app.routes, []);
      app.click();
      assert.deepEqual(app.routes, ["/sign-in?callbackUrl=%2Fcourses%2Ftest"]);
      assert.equal(app.dialogs().length, 0);
      assert.equal(app.videos().length, 0);
    }
  }
});

test("nonmembers clicking member videos or resources see the membership message and dashboard link", () => {
  for (const isVideo of [true, false]) {
    const app = interactive(["free_for_members"], {
      email: "learner@example.com",
      isVideo,
    });
    assert.equal(app.dialogs().length, 0);
    app.click();
    assert.deepEqual(app.routes, []);
    assert.equal(app.dialogs().length, 1);
    assert.match(
      app.descriptions()[0].props.children,
      /Please become an RH member first/,
    );
    assert.equal(app.links()[0].props.href, "/dashboard/id-card");
    assert.equal(app.videos().length, 0);
  }
});

test("members and enrolled learners can play member lessons without the membership prompt", () => {
  for (const access of [{ isMember: true }, { isEnrolled: true }]) {
    const app = interactive(["free_for_members"], {
      email: "learner@example.com",
      ...access,
    });
    app.click();
    assert.deepEqual(app.routes, []);
    assert.equal(app.videos().length, 1);
    assert.equal(app.links().length, 0);
  }
});
