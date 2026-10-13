const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const ts = require("typescript");
const axios = require("axios");
const root = path.resolve(__dirname, "..");
const mobileRequire = createRequire(path.join(root, "../my-app/package.json"));

function load(file, dependencies, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(path.resolve(root, file), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(
    code,
    {
      exports,
      console: { warn() {}, error() {} },
      __DEV__: false,
      ...globals,
      require: (id) => {
        assert.ok(id in dependencies, `Unexpected dependency ${id}`);
        return dependencies[id];
      },
    },
    { filename: file },
  );
  return exports;
}

function setupServer({ failure, tokens = { IdToken: "new-id-token" } } = {}) {
  const commands = [];
  const logs = [];
  class GetTokensFromRefreshTokenCommand {
    constructor(input) {
      this.input = input;
    }
  }
  const route = load(
    "app/api/auth/mobile/refresh/route.ts",
    {
      "next/server": {
        NextResponse: {
          json: (body, options) => ({ body, status: options?.status || 200 }),
        },
      },
      "@/env": {
        AWS_COGNITO_REGION: "test-region",
        USER_POOL_CLIENT_ID: "test-client",
        USER_POOL_CLIENT_SECRET: "test-secret",
      },
      "@aws-sdk/client-cognito-identity-provider": {
        GetTokensFromRefreshTokenCommand,
        CognitoIdentityProviderClient: class {
          async send(command) {
            commands.push(command);
            if (failure) throw failure;
            return { AuthenticationResult: tokens };
          }
        },
      },
    },
    { console: { error: (...args) => logs.push(args) } },
  );
  return {
    commands,
    logs,
    run: (body) => route.POST({ json: async () => body }),
  };
}

const auth = load("../my-app/store/authSlice.ts", {
  "@reduxjs/toolkit": mobileRequire("@reduxjs/toolkit"),
});

function authError(status, config) {
  return new axios.AxiosError(
    "Request failed",
    "ERR_BAD_RESPONSE",
    config,
    {},
    {
      status,
      data: { error: "Unauthorized: Invalid token" },
      headers: {},
      config,
      statusText: "Error",
    },
  );
}

function setupMobile({
  refreshStatus,
  timeout = false,
  rotated = true,
  alwaysUnauthorized = false,
  lateGate,
} = {}) {
  let state = auth.default(
    undefined,
    auth.setCredentials({ token: "expired-id" }),
  );
  const storage = new Map([
    ["userToken", "expired-id"],
    ["refreshToken", "saved-refresh"],
    ["authUsername", "login-alias@example.com"],
    ["authDeviceKey", "remembered-device"],
  ]);
  const requests = [];
  const refreshCalls = [];
  const store = {
    getState: () => ({ auth: state }),
    dispatch: (action) => {
      state = auth.default(state, action);
    },
  };
  const mockAxios = {
    isAxiosError: axios.isAxiosError,
    create: (config) =>
      axios.create({
        ...config,
        adapter: async (request) => {
          requests.push(request);
          if (request.url === "/late" && !request._retry && lateGate)
            await lateGate;
          if (
            request.headers.get("Authorization") === "Bearer expired-id" ||
            alwaysUnauthorized
          ) {
            throw authError(401, request);
          }
          return {
            status: 200,
            statusText: "OK",
            data: { success: true, user: { name: "Member" } },
            headers: {},
            config: request,
          };
        },
      }),
    post: async (url, body) => {
      refreshCalls.push({ url, body });
      await Promise.resolve();
      if (timeout) throw new axios.AxiosError("timeout", "ECONNABORTED");
      if (refreshStatus) throw authError(refreshStatus, {});
      return {
        data: {
          success: true,
          tokens: {
            IdToken: "fresh-id",
            ...(rotated && { RefreshToken: "rotated-refresh" }),
          },
        },
      };
    },
  };
  const { default: api } = load(
    "../my-app/lib/api.ts",
    {
      axios: { default: mockAxios },
      "@/store/authSlice": auth,
      "@/const/config": { API_BASE_URL: "https://example.com" },
      "react-native": { Platform: { OS: "ios" } },
      "expo-secure-store": {
        getItemAsync: async (key) => storage.get(key) || null,
        setItemAsync: async (key, value) => storage.set(key, value),
        deleteItemAsync: async (key) => storage.delete(key),
      },
      "@/store": { store },
    },
    {
      globalThis: {
        atob: (value) => Buffer.from(value, "base64").toString("utf8"),
      },
    },
  );
  return { api, storage, store, requests, refreshCalls };
}

test("server refresh uses the app secret directly and works without an email/username", async () => {
  const harness = setupServer({
    tokens: { IdToken: "fresh-id", RefreshToken: "rotated-refresh" },
  });
  const response = await harness.run({
    refreshToken: "saved-refresh",
    deviceKey: "remembered-device",
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.tokens.RefreshToken, "rotated-refresh");
  assert.deepEqual(JSON.parse(JSON.stringify(harness.commands[0].input)), {
    ClientId: "test-client",
    ClientSecret: "test-secret",
    RefreshToken: "saved-refresh",
    DeviceKey: "remembered-device",
  });
});

test("old mobile clients can send their login email without affecting refresh authentication", async () => {
  const harness = setupServer();
  const response = await harness.run({
    refreshToken: "saved-refresh",
    username: "login-alias@example.com",
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.username, "login-alias@example.com");
  assert.equal(harness.commands[0].input.AuthParameters, undefined);
});

test("server only returns 401 for rejected sessions and redacts secrets from diagnostics", async () => {
  for (const name of [
    "NotAuthorizedException",
    "RefreshTokenReuseException",
    "UserNotFoundException",
  ]) {
    const harness = setupServer({
      failure: { name, message: "Rejected saved-refresh and test-secret" },
    });
    const response = await harness.run({ refreshToken: "saved-refresh" });
    assert.equal(response.status, 401);
    assert.equal(response.body.code, "SESSION_EXPIRED");
    assert.ok(!JSON.stringify(harness.logs).includes("saved-refresh"));
    assert.ok(!JSON.stringify(harness.logs).includes("test-secret"));
  }
});

test("service failures and incomplete token responses remain retryable", async () => {
  for (const name of [
    "InternalErrorException",
    "TooManyRequestsException",
    "InvalidParameterException",
  ]) {
    const harness = setupServer({
      failure: { name, message: "service failure" },
    });
    assert.equal(
      (await harness.run({ refreshToken: "saved-refresh" })).status,
      503,
    );
  }
  assert.equal(
    (await setupServer({ tokens: {} }).run({ refreshToken: "saved-refresh" }))
      .status,
    503,
  );
  const missing = setupServer();
  assert.equal((await missing.run({ refreshToken: "" })).status, 400);
  assert.equal(missing.commands.length, 0);
});

test("expired mobile ID token refreshes, persists rotated tokens, and retries the profile request", async () => {
  const harness = setupMobile();
  assert.equal((await harness.api.get("/profile")).status, 200);
  assert.equal(harness.refreshCalls.length, 1);
  assert.equal(harness.refreshCalls[0].body.deviceKey, "remembered-device");
  assert.equal(harness.storage.get("userToken"), "fresh-id");
  assert.equal(harness.storage.get("refreshToken"), "rotated-refresh");
  assert.equal(harness.store.getState().auth.token, "fresh-id");
  harness.store.dispatch(auth.setCredentials({ user: { name: "Member" } }));
  assert.equal(harness.store.getState().auth.token, "fresh-id");
  assert.equal(harness.store.getState().auth.user.name, "Member");
});

test("refresh keeps the original refresh token when Cognito does not rotate it", async () => {
  const harness = setupMobile({ rotated: false });
  await harness.api.get("/profile");
  assert.equal(harness.storage.get("refreshToken"), "saved-refresh");
});

test("simultaneous expired-token requests share a single refresh", async () => {
  const harness = setupMobile();
  await Promise.all(
    ["/profile", "/courses", "/workshops"].map((url) => harness.api.get(url)),
  );
  assert.equal(harness.refreshCalls.length, 1);
  assert.equal(harness.store.getState().auth.token, "fresh-id");
});

test("a late 401 reuses the refreshed token instead of rotating again", async () => {
  let release;
  const lateGate = new Promise((resolve) => {
    release = resolve;
  });
  const harness = setupMobile({ lateGate });
  const late = harness.api.get("/late");
  await harness.api.get("/profile");
  release();
  assert.equal((await late).status, 200);
  assert.equal(harness.refreshCalls.length, 1);
});

test("timeout and temporary refresh errors preserve the session for a later retry", async () => {
  for (const options of [{ timeout: true }, { refreshStatus: 503 }]) {
    const harness = setupMobile(options);
    await assert.rejects(harness.api.get("/profile"), /Check your connection/);
    assert.equal(harness.storage.get("refreshToken"), "saved-refresh");
    assert.equal(harness.storage.get("userToken"), "expired-id");
    assert.equal(harness.store.getState().auth.isAuthenticated, true);
  }
});

test("a rejected refresh token ends the local session and clears all stored credentials", async () => {
  const harness = setupMobile({ refreshStatus: 401 });
  await assert.rejects(harness.api.get("/profile"));
  assert.equal(harness.storage.size, 0);
  assert.equal(harness.store.getState().auth.isAuthenticated, false);
});

test("requests retry only once when the refreshed token is rejected too", async () => {
  const harness = setupMobile({ alwaysUnauthorized: true });
  await assert.rejects(harness.api.get("/profile"));
  assert.equal(harness.refreshCalls.length, 1);
  assert.equal(harness.requests.length, 2);
  assert.equal(harness.store.getState().auth.isAuthenticated, false);
});
