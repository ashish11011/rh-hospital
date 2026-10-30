const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");

function verificationForm({
  credentials = { email: "member@example.com", password: "ValidPass1!" },
  confirm = async () => ({ success: true }),
  login = async () => ({ success: true }),
} = {}) {
  const states = [],
    calls = [],
    routes = [];
  let cursor = 0,
    refreshes = 0;
  const mocks = {
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
      useRouter: () => ({
        replace: (href) => routes.push(href),
        refresh: () => {
          refreshes++;
        },
      }),
      useSearchParams: () =>
        new URLSearchParams({ email: " Member@Example.COM " }),
    },
    "@/lib/actions/auth": {
      confirmWithCognito: async (data) => {
        calls.push(["confirm", data]);
        return confirm(data);
      },
      loginWithCredentials: async (data) => {
        calls.push(["login", data]);
        return login(data);
      },
      resendVerificationCode: async () => ({ success: true }),
    },
    "./pending-credentials": {
      usePendingCredentials: () => ({
        credentials,
        setCredentials: (value) => {
          credentials = value;
        },
      }),
    },
    "./auth-link": { AuthLink: "AuthLink" },
    "./password-input": { default: "PasswordInput", __esModule: true },
    "@/components/ui/button": { Button: "Button" },
    "@/components/ui/input": { Input: "Input" },
    "@/components/ui/label": { Label: "Label" },
  };
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(
      path.join(__dirname, "../components/auth/verify-email-form.tsx"),
      "utf8",
    ),
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
  function render() {
    cursor = 0;
    return exports.default();
  }
  function elements(type) {
    const found = [];
    function visit(node) {
      if (!React.isValidElement(node)) return;
      if (node.type === type) found.push(node);
      React.Children.forEach(node.props.children, visit);
    }
    visit(render());
    return found;
  }
  return {
    calls,
    routes,
    elements,
    getCredentials: () => credentials,
    getRefreshes: () => refreshes,
    code: (value) => elements("Input")[0].props.onChange({ target: { value } }),
    password: (value) =>
      elements("PasswordInput")[0].props.onChange({ target: { value } }),
    submit: () => render().props.onSubmit({ preventDefault() {} }),
  };
}

test("verification automatically establishes the website session before opening the dashboard", async () => {
  const app = verificationForm();
  assert.equal(app.elements("PasswordInput").length, 0);
  app.code("123456");
  await app.submit();
  assert.deepEqual(app.calls, [
    ["confirm", { email: "member@example.com", code: "123456" }],
    ["login", { email: "member@example.com", password: "ValidPass1!" }],
  ]);
  assert.deepEqual(app.routes, ["/dashboard"]);
  assert.equal(app.getRefreshes(), 1);
  assert.equal(app.getCredentials(), null);
});

test("an invalid verification code never attempts sign-in", async () => {
  const app = verificationForm({
    confirm: async () => ({ error: "Invalid code" }),
  });
  app.code("wrong");
  await app.submit();
  assert.deepEqual(
    app.calls.map(([type]) => type),
    ["confirm"],
  );
  assert.deepEqual(app.routes, []);
  assert.equal(
    app.elements("div").find((node) => node.props.role === "alert").props
      .children,
    "Invalid code",
  );
  assert.equal(app.elements("Button")[0].props.disabled, false);
});

test("missing verification codes cannot start verification or sign-in", async () => {
  const app = verificationForm();
  await app.submit();
  assert.deepEqual(app.calls, []);
});

test("a refreshed verification page accepts the password and signs in without a separate login page", async () => {
  const app = verificationForm({ credentials: null });
  app.code("123456");
  await app.submit();
  assert.deepEqual(app.calls, []);
  app.password("ValidPass1!");
  await app.submit();
  assert.deepEqual(app.routes, ["/dashboard"]);
  assert.deepEqual(app.calls[1], [
    "login",
    { email: "member@example.com", password: "ValidPass1!" },
  ]);
  assert.equal(app.elements("PasswordInput")[0].props.value, "");
});

test("verification never uses a pending password belonging to another email", async () => {
  const app = verificationForm({
    credentials: { email: "other@example.com", password: "OtherPass1!" },
  });
  app.code("123456");
  await app.submit();
  assert.deepEqual(app.calls, []);
  app.password("CorrectPass1!");
  await app.submit();
  assert.equal(app.calls[1][1].password, "CorrectPass1!");
});

test("a failed automatic sign-in can retry with a corrected password without reusing the verification code", async () => {
  let attempts = 0;
  const app = verificationForm({
    login: async () =>
      ++attempts === 1 ? { error: "Incorrect password" } : { success: true },
  });
  app.code("123456");
  await app.submit();
  assert.deepEqual(app.routes, []);
  assert.equal(app.getCredentials(), null);
  assert.equal(app.elements("Input").length, 0);
  app.password("CorrectPass1!");
  await app.submit();
  assert.deepEqual(
    app.calls.map(([type]) => type),
    ["confirm", "login", "login"],
  );
  assert.equal(app.calls[2][1].password, "CorrectPass1!");
  assert.deepEqual(app.routes, ["/dashboard"]);
});

test("a network failure after verification can retry sign-in without verifying twice", async () => {
  let attempts = 0;
  const app = verificationForm({
    login: async () => {
      if (++attempts === 1) throw new Error("Network unavailable");
      return { success: true };
    },
  });
  app.code("123456");
  await app.submit();
  assert.equal(app.elements("Button")[0].props.disabled, false);
  assert.deepEqual(app.routes, []);
  await app.submit();
  assert.deepEqual(
    app.calls.map(([type]) => type),
    ["confirm", "login", "login"],
  );
  assert.deepEqual(app.routes, ["/dashboard"]);
});
