const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const crypto = require("node:crypto");

function load(file, dependencies) {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports,
    require(id) {
      assert.ok(id in dependencies, `Unexpected dependency: ${id}`);
      return dependencies[id];
    },
  });
  return exports;
}

const input = {
  email: " Member@Example.COM ", name: "Member", code: "123456",
  password: " MixedCase Password! ", confirmPassword: " MixedCase Password! ",
};
const email = "member@example.com";
const expectedHash = crypto.createHmac("sha256", "secret")
  .update(email + "client").digest("base64");

function setup({ existing = true } = {}) {
  const commands = [], logs = [], inserts = [], updates = [], lookups = [];
  class Command { constructor(input) { this.input = input; } }
  const sdk = Object.fromEntries([
    "SignUpCommand", "ConfirmSignUpCommand", "ForgotPasswordCommand",
    "ConfirmForgotPasswordCommand", "ResendConfirmationCodeCommand",
  ].map((name) => [name, Command]));
  sdk.CognitoIdentityProviderClient = class {
    async send(command) { commands.push(command.input); return {}; }
  };
  const dependencies = {
    "@aws-sdk/client-cognito-identity-provider": sdk,
    "@/env": { USER_POOL_CLIENT_ID: "client", USER_POOL_CLIENT_SECRET: "secret" },
    crypto: { default: crypto },
    "@/db": { user: { email: "email" } },
    "drizzle-orm": { eq: (column, value) => ({ column, value }) },
    "@/lib/dbConfig": { db: {
      select: () => ({ from: () => ({ where: (filter) => ({ limit: async () => {
        lookups.push(filter.value);
        return existing && filter.value === email ? [{ email }] : [];
      } }) }) }),
      insert: () => ({ values: async (value) => inserts.push(value) }),
      update: () => ({ set: (value) => ({ where: async (filter) => updates.push({ ...value, email: filter.value }) }) }),
    } },
    "@/lib/emailLogging": { logCognitoEmail: async (recipient, purpose, send) => {
      logs.push(recipient); return send();
    } },
    "@/auth": {}, "next-auth": {}, "@/lib/login-errors": {},
    "next/server": { NextResponse: { json: (body, options) => ({ body, status: options.status }) } },
  };
  return { dependencies, commands, logs, inserts, updates, lookups };
}

for (const [action, route, argument] of [
  ["signupWithCognito", "signup", input],
  ["confirmWithCognito", "confirm", input],
  ["forgotPasswordWithCognito", "forgot-password", input.email],
  ["resetPasswordWithCognito", "reset-password", input],
  ["resendVerificationCode", "resend-code", input.email],
]) {
  for (const surface of ["website", "mobile"]) {
    test(`${surface} ${route} uses lowercase email for Cognito, secret hashes and database operations`, async () => {
      const harness = setup({ existing: route !== "signup" });
      const api = load(surface === "website" ? "lib/actions/auth.ts" : `app/api/auth/mobile/${route}/route.ts`, harness.dependencies);
      const result = surface === "website"
        ? await api[action](argument)
        : (await api.POST({ json: async () => ({ ...input }) })).body;
      assert.equal(result.success, true);
      assert.equal(harness.commands.length, 1);
      const command = harness.commands[0];
      assert.equal(command.Username, email);
      assert.equal(command.SecretHash, expectedHash);
      if (command.Password) assert.equal(command.Password, input.password);
      if (command.ConfirmationCode) assert.equal(command.ConfirmationCode, input.code);
      if (route === "signup") {
        assert.equal(command.UserAttributes.find((item) => item.Name === "email").Value, email);
        assert.equal(harness.inserts[0].email, email);
      }
      if (route === "confirm") {
        assert.equal(harness.updates[0].email, email);
        assert.equal(harness.updates[0].isVarifiedEmail, true);
      }
      for (const recipient of [...harness.logs, ...harness.lookups]) assert.equal(recipient, email);
    });
  }
}

test("auth form schemas normalize email and preserve passwords and verification codes", () => {
  const schemas = load("lib/validations/auth.ts", { zod: require("zod") });
  for (const name of ["loginSchema", "signupSchema", "forgotPasswordSchema", "resetPasswordSchema"]) {
    const result = schemas[name].parse(input);
    assert.equal(result.email, email);
    if (result.password) assert.equal(result.password, input.password);
    if (result.code) assert.equal(result.code, input.code);
    assert.equal(schemas[name].safeParse({ ...input, email: "  " }).success, false);
  }
});
