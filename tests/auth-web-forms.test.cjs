const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");

function signupForm(result) {
  const states = [],
    routes = [];
  let cursor = 0;
  let credentials = null;
  const values = {
    name: "Member",
    email: "member@example.com",
    password: "ValidPass1!",
    confirmPassword: "ValidPass1!",
  };
  const mocks = {
    react: {
      ...React,
      useState: (initial) => {
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
    "@/lib/actions/auth": { signupWithCognito: async () => result },
    "./pending-credentials": {
      usePendingCredentials: () => ({
        credentials,
        setCredentials: (value) => {
          credentials = value;
        },
      }),
    },
    "react-hook-form": {
      useForm: () => ({
        register: (name) => ({ name }),
        watch: (name) => values[name],
        handleSubmit: (submit) => () => submit(values),
        formState: { errors: {}, isSubmitting: false },
      }),
    },
    "@hookform/resolvers/zod": { zodResolver() {} },
    "@/lib/validations/auth": {},
    "./auth-link": { AuthLink: "AuthLink" },
    "./password-input": { default: "PasswordInput", __esModule: true },
    "./password-requirements": { PasswordRequirements: "PasswordRequirements" },
    "@/components/ui/button": { Button: "Button" },
    "@/components/ui/input": { Input: "Input" },
    "@/components/ui/label": { Label: "Label" },
  };
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(
      path.join(__dirname, "../components/auth/signup-form.tsx"),
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
  const render = () => {
    cursor = 0;
    return exports.default();
  };
  const elements = (type) => {
    const found = [];
    function visit(node) {
      if (!React.isValidElement(node)) return;
      if (node.type === type) found.push(node);
      React.Children.forEach(node.props.children, visit);
    }
    visit(render());
    return found;
  };
  return {
    routes,
    render,
    elements,
    getCredentials: () => credentials,
    submit: () => render().props.onSubmit(),
  };
}

test("website existing unconfirmed accounts open verification", async () => {
  const app = signupForm({
    error: "exists",
    nextStep: "verify_email",
    message: "Verify email",
  });
  await app.submit();
  assert.deepEqual(app.routes, ["/verify-email?email=member%40example.com"]);
  assert.deepEqual(app.getCredentials(), {
    email: "member@example.com",
    password: "ValidPass1!",
  });
});

test("website confirmed accounts stay on the form with sign-in/reset links and no verification redirect", async () => {
  const app = signupForm({
    error: "exists",
    nextStep: "sign_in",
    message: "An account already exists.",
  });
  await app.submit();
  assert.equal(app.routes.length, 0);
  assert.equal(app.getCredentials(), null);
  const hrefs = app.elements("AuthLink").map((node) => node.props.href);
  assert.ok(hrefs.includes("/sign-in?email=member%40example.com"));
  assert.ok(hrefs.includes("/forgot-password?email=member%40example.com"));
  assert.ok(!hrefs.some((href) => href.startsWith("/verify-email")));
});

test("website unknown account state keeps verification available alongside sign-in and reset", async () => {
  const app = signupForm({
    error: "exists",
    nextStep: "choose",
    message: "Choose a recovery option.",
  });
  await app.submit();
  assert.ok(
    app
      .elements("AuthLink")
      .some(
        (node) =>
          node.props.href === "/verify-email?email=member%40example.com",
      ),
  );
});

test("website reset-required accounts open password recovery with their email", async () => {
  const app = signupForm({ error: "exists", nextStep: "reset_password" });
  await app.submit();
  assert.deepEqual(app.routes, ["/forgot-password?email=member%40example.com"]);
});

test("website new signup retains email verification and shows the current password checklist", async () => {
  const app = signupForm({ success: true });
  assert.equal(
    app.elements("PasswordRequirements")[0].props.password,
    "ValidPass1!",
  );
  await app.submit();
  assert.deepEqual(app.routes, ["/verify-email?email=member%40example.com"]);
  assert.deepEqual(app.getCredentials(), {
    email: "member@example.com",
    password: "ValidPass1!",
  });
});
