const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const crypto = require("node:crypto");
const {
  AuthError,
  CredentialsSignin,
  CallbackRouteError,
} = require("@auth/core/errors");
const root = path.resolve(__dirname, "..");

function load(file, dependencies) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(path.join(root, file), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    process: { env: {} },
    console: { error() {} },
    require(id) {
      assert.ok(id in dependencies, `Unexpected dependency ${id}`);
      return dependencies[id];
    },
  });
  return exports;
}

function setup({
  authFailure,
  lookupFailure,
  enabled = true,
  tokens,
  signInFailure,
} = {}) {
  const commands = [];
  const env = {
    USER_POOL_ID: "test-pool",
    USER_POOL_CLIENT_ID: "test-client",
    USER_POOL_CLIENT_SECRET: "test-secret",
    AWS_COGNITO_REGION: "test-region",
  };
  class AdminGetUserCommand {
    constructor(input) {
      this.input = input;
    }
  }
  class InitiateAuthCommand {
    constructor(input) {
      this.input = input;
    }
  }
  const sdk = {
    AdminGetUserCommand,
    InitiateAuthCommand,
    CognitoIdentityProviderClient: class {
      async send(command) {
        commands.push(command);
        if (command instanceof AdminGetUserCommand) {
          if (lookupFailure) throw lookupFailure;
          return { Enabled: enabled };
        }
        if (authFailure) throw authFailure;
        return { AuthenticationResult: tokens || { IdToken: "valid-token" } };
      }
    },
  };
  const dependencies = {
    "@/env": env,
    "./env": env,
    "@aws-sdk/client-cognito-identity-provider": sdk,
    crypto: { default: crypto },
  };
  const errors = load("lib/login-errors.ts", dependencies);
  dependencies["@/lib/login-errors"] = errors;
  let config;
  load("auth.ts", {
    ...dependencies,
    "next-auth": {
      CredentialsSignin,
      default: (value) => {
        config = value;
        return {};
      },
    },
    "next-auth/providers/cognito": {
      default: (value) => ({ ...value, id: "cognito", type: "oidc" }),
    },
    "next-auth/providers/credentials": {
      default: (value) => ({
        ...value,
        id: "credentials",
        type: "credentials",
      }),
    },
  });
  const authorize = config.providers[1].authorize;
  const actions = load("lib/actions/auth.ts", {
    ...dependencies,
    "@/lib/emailLogging": {},
    "@/auth": {
      async signIn(provider, credentials) {
        if (signInFailure) throw signInFailure;
        try {
          await authorize(credentials);
        } catch (err) {
          if (err instanceof AuthError) throw err;
          throw new CallbackRouteError(err);
        }
      },
    },
    "next-auth": { AuthError, CredentialsSignin },
    "@/lib/dbConfig": { db: {} },
    "@/db": {},
    "drizzle-orm": {},
  });
  const route = load("app/api/auth/mobile/login/route.ts", {
    ...dependencies,
    "next/server": {
      NextResponse: {
        json: (body, options) => ({ body, status: options.status }),
      },
    },
    "@/lib/dbConfig": {
      db: {
        select: () => ({
          from: () => ({ where: () => ({ limit: async () => [] }) }),
        }),
      },
    },
    "@/db": { user: {} },
    "drizzle-orm": { eq() {} },
  });
  return {
    errors,
    commands,
    config,
    website: () =>
      actions.loginWithCredentials({
        email: " Member@Example.COM ",
        password: "wrong",
      }),
    mobile: (body = { email: " Member@Example.COM ", password: "wrong" }) =>
      route.POST({ json: async () => body }),
  };
}

const badPassword = {
  name: "NotAuthorizedException",
  message: "Incorrect username or password.",
};
const missingUser = {
  name: "UserNotFoundException",
  message: "provider detail",
};

for (const [label, options, message, status] of [
  [
    "missing user",
    { authFailure: missingUser },
    "User doesn't exist. Please create an account.",
    401,
  ],
  [
    "masked missing user",
    { authFailure: badPassword, lookupFailure: missingUser },
    "User doesn't exist. Please create an account.",
    401,
  ],
  [
    "wrong password",
    { authFailure: badPassword },
    "Incorrect password. Please try again.",
    401,
  ],
  [
    "reset required",
    { authFailure: { name: "PasswordResetRequiredException" } },
    "You need to reset your password. Please use Forgot password.",
    403,
  ],
  [
    "disabled user",
    {
      authFailure: {
        name: "NotAuthorizedException",
        message: "User is disabled.",
      },
    },
    "Your account is disabled. Please contact support.",
    403,
  ],
  [
    "rate limit",
    { authFailure: { name: "TooManyRequestsException" } },
    "Too many login attempts. Please wait a few minutes and try again.",
    429,
  ],
  [
    "password attempt limit",
    {
      authFailure: {
        name: "NotAuthorizedException",
        message: "Password attempts exceeded",
      },
    },
    "Too many login attempts. Please wait a few minutes and try again.",
    429,
  ],
  [
    "configuration failure",
    {
      authFailure: {
        name: "NotAuthorizedException",
        message: "SecretHash does not match test-secret",
      },
    },
    "Unable to sign in right now. Please try again later.",
    503,
  ],
  [
    "provider failure",
    {
      authFailure: {
        name: "InternalErrorException",
        message: "private detail",
      },
    },
    "Unable to sign in right now. Please try again later.",
    503,
  ],
  [
    "lookup unavailable",
    {
      authFailure: badPassword,
      lookupFailure: { name: "AccessDeniedException" },
    },
    "Unable to verify your email or password. Please check your details and try again.",
    401,
  ],
]) {
  test(`${label} gives the same readable error on website and mobile`, async () => {
    const harness = setup(options);
    assert.equal((await harness.website()).error, message);
    const mobile = await harness.mobile();
    assert.equal(mobile.body.error, message);
    assert.equal(mobile.status, status);
    if (options.authFailure === badPassword) {
      const lookups = harness.commands.filter(
        (command) => command.constructor.name === "AdminGetUserCommand",
      );
      assert.equal(lookups.length, 2);
      assert.equal(lookups[0].input.Username, "member@example.com");
    }
  });
}

test("unverified email preserves website verification routing and gives mobile a message", async () => {
  const harness = setup({ authFailure: { name: "UserNotConfirmedException" } });
  assert.equal((await harness.website()).error, "unconfirmed");
  const response = await harness.mobile();
  assert.equal(response.status, 403);
  assert.equal(response.body.error, "unconfirmed");
  assert.equal(
    response.body.message,
    "Please verify your email before signing in.",
  );
});

test("successful logins lowercase and trim email without changing passwords or querying account existence", async () => {
  const harness = setup();
  assert.equal((await harness.website()).success, true);
  const mobile = await harness.mobile();
  assert.equal(mobile.status, 200);
  assert.equal(mobile.body.tokens.IdToken, "valid-token");
  assert.equal(mobile.body.username, "member@example.com");
  assert.equal(harness.commands.length, 2);
  for (const command of harness.commands) {
    assert.equal(command.input.AuthParameters.USERNAME, "member@example.com");
    assert.equal(command.input.AuthParameters.PASSWORD, "wrong");
    assert.equal(
      command.input.AuthParameters.SECRET_HASH,
      crypto.createHmac("sha256", "test-secret")
        .update("member@example.comtest-client").digest("base64"),
    );
  }
});

test("Cognito sessions normalize email from existing identity provider profiles", async () => {
  const harness = setup();
  const token = await harness.config.callbacks.jwt({ token: { email: " Member@Example.COM ", sub: "member-id" } });
  assert.equal(token.email, "member@example.com");
  assert.equal(token.sub, "member-id");
});

test("mobile rejects blank credentials without calling Cognito", async () => {
  const harness = setup();
  assert.equal(
    (await harness.mobile({ email: "  ", password: "password" })).status,
    400,
  );
  assert.equal(harness.commands.length, 0);
});

test("plain CredentialsSignin without a cause returns a credential message", async () => {
  const harness = setup({ signInFailure: new CredentialsSignin() });
  assert.equal(
    (await harness.website()).error,
    "Unable to verify your email or password. Please check your details and try again.",
  );
});

test("real Auth.js callback preserves the Cognito error code for the server action", async () => {
  const { Auth, raw, skipCSRFCheck } = await import("@auth/core");
  for (const [options, code] of [
    [{ authFailure: badPassword }, "INCORRECT_PASSWORD"],
    [
      { authFailure: badPassword, lookupFailure: missingUser },
      "USER_NOT_FOUND",
    ],
  ]) {
    const harness = setup(options);
    await assert.rejects(
      Auth(
        new Request("http://localhost/api/auth/callback/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            email: "member@example.com",
            password: "wrong",
          }),
        }),
        {
          ...harness.config,
          secret: "test-auth-secret",
          basePath: "/api/auth",
          trustHost: true,
          raw,
          skipCSRFCheck,
          logger: { error() {}, warn() {}, debug() {} },
        },
      ),
      (error) => error instanceof CredentialsSignin && error.code === code,
    );
  }
});
