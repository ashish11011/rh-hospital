const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function load(file, mocks = {}) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
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

function setup({
  status = "CONFIRMED",
  enabled = true,
  failure,
  exists = true,
  databaseUser = true,
} = {}) {
  const commands = [],
    inserts = [],
    queries = [];
  class SignUpCommand {
    constructor(input) {
      this.input = input;
    }
  }
  class AdminGetUserCommand {
    constructor(input) {
      this.input = input;
    }
  }
  const mocks = {
    "@/env": {
      USER_POOL_ID: "pool",
      USER_POOL_CLIENT_ID: "client",
      USER_POOL_CLIENT_SECRET: "secret",
    },
    "@aws-sdk/client-cognito-identity-provider": {
      SignUpCommand,
      AdminGetUserCommand,
      CognitoIdentityProviderClient: class {
        async send(command) {
          commands.push(command);
          if (command instanceof SignUpCommand && exists) {
            const error = new Error("already exists");
            error.name = "UsernameExistsException";
            throw error;
          }
          if (command instanceof AdminGetUserCommand) {
            if (failure) throw failure;
            return { Enabled: enabled, UserStatus: status };
          }
          return {};
        }
      },
    },
    "@/auth": {},
    "next-auth": {},
    "@/lib/emailLogging": {
      logCognitoEmail: (_email, _purpose, send) => send(),
    },
    "@/db": { user: { email: "email" } },
    "drizzle-orm": { eq: (field, value) => ({ field, value }) },
    "@/lib/dbConfig": {
      db: {
        select: () => ({
          from: () => ({
            where: (condition) => ({
              limit: async () => {
                queries.push(condition);
                return databaseUser ? [{ id: "existing-user-id" }] : [];
              },
            }),
          }),
        }),
        insert: () => ({ values: async (value) => inserts.push(value) }),
      },
    },
    "next/server": {
      NextResponse: {
        json: (body, options) => ({ body, status: options.status }),
      },
    },
  };
  const actions = load("lib/actions/auth.ts", mocks);
  const route = load("app/api/auth/mobile/signup/route.ts", mocks);
  const input = {
    email: " Imported@Example.COM ",
    name: "Imported",
    password: "ValidPass1!",
  };
  return {
    commands,
    inserts,
    queries,
    input,
    website: () => actions.signupWithCognito(input),
    mobile: async () => (await route.POST({ json: async () => input })).body,
  };
}

for (const [status, nextStep, code] of [
  ["UNCONFIRMED", "verify_email", "EMAIL_NOT_VERIFIED"],
  ["CONFIRMED", "sign_in", "ACCOUNT_EXISTS"],
  ["RESET_REQUIRED", "reset_password", "PASSWORD_RESET_REQUIRED"],
  ["UNKNOWN", "choose", "ACCOUNT_EXISTS"],
]) {
  test(`existing ${status} accounts get the correct next step on web and mobile without database changes`, async () => {
    for (const surface of ["website", "mobile"]) {
      const app = setup({ status });
      const result = await app[surface]();
      assert.equal(result.nextStep, nextStep);
      assert.equal(result.code, code);
      assert.equal(result.email, "imported@example.com");
      assert.equal(result.error, "exists");
      assert.notEqual(result.message, "exists");
      assert.equal(app.commands[1].input.Username, "imported@example.com");
      assert.equal(app.commands[1].input.UserPoolId, "pool");
      assert.equal(app.inserts.length, 0);
      assert.equal(app.queries.length, 0);
    }
  });
}

test("disabled accounts do not get signup recovery links", async () => {
  for (const surface of ["website", "mobile"]) {
    const app = setup({ enabled: false });
    const result = await app[surface]();
    assert.equal(result.nextStep, "none");
    assert.equal(result.code, "ACCOUNT_DISABLED");
  }
});

test("IAM or provider lookup failure keeps sign-in, reset and verification choices available", async () => {
  for (const surface of ["website", "mobile"]) {
    const failure = Object.assign(new Error("private provider detail"), {
      name: "AccessDeniedException",
    });
    const app = setup({ failure });
    const result = await app[surface]();
    assert.equal(result.nextStep, "choose");
    assert.doesNotMatch(result.message, /private/);
  }
});

test("new and imported users retain the existing database insertion behavior", async () => {
  for (const surface of ["website", "mobile"]) {
    for (const databaseUser of [true, false]) {
      const app = setup({ exists: false, databaseUser });
      assert.equal((await app[surface]()).success, true);
      assert.equal(app.commands.length, 1);
      assert.equal(app.inserts.length, databaseUser ? 0 : 1);
      if (!databaseUser)
        assert.equal(app.inserts[0].email, "imported@example.com");
    }
  }
});

test("signup/reset enforce every password rule locally and login accepts existing passwords", () => {
  const schemas = load("lib/validations/auth.ts");
  const input = { name: "Member", email: "member@example.com", code: "123456" };
  for (const password of [
    "Aa1!",
    "lowercase1!",
    "UPPERCASE1!",
    "NoNumbers!",
    "NoSpecial123",
    "Abcdef1 ",
  ]) {
    for (const name of ["signupSchema", "resetPasswordSchema"]) {
      assert.equal(
        schemas[name].safeParse({
          ...input,
          password,
          confirmPassword: password,
        }).success,
        false,
        `${name}: ${password}`,
      );
    }
  }
  for (const name of ["signupSchema", "resetPasswordSchema"]) {
    const password = " ValidPass1! ";
    assert.equal(
      schemas[name].parse({ ...input, password, confirmPassword: password })
        .password,
      password,
    );
  }
  assert.equal(
    schemas.loginSchema.safeParse({ email: input.email, password: "old" })
      .success,
    true,
  );
});
