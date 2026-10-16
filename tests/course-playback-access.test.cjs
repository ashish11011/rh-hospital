const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const crypto = require("node:crypto");
const ts = require("typescript");
const signer = require("@aws-sdk/cloudfront-signer");
function load(file, modules = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
    {
      exports,
      URL,
      Error,
      Date,
      Response,
      Headers,
      Request,
      console,
      ...globals,
      require: (name) => {
        assert.ok(name in modules, `Unexpected import: ${name}`);
        return modules[name];
      },
    },
  );
  return exports;
}
const media = load("lib/courseMedia.ts");
const playback = load("lib/coursePlayback.ts", {
  "./cloudfront": {
    COURSE_CLOUDFRONT_URL: "https://media.rhhealthcaresimulation.com",
  },
  "./courseMedia": media,
});
const publicAssets = load("lib/publicAsset.ts", {
  "./cloudfront": {},
  "./courseMedia": media,
});
const ids = {
  course: "10000000-0000-4000-8000-000000000001",
  item: "20000000-0000-4000-8000-000000000001",
};
const email = "learner@example.com";
const key = "course/transcoded/nrp/videos/Trauma+Triage-001/index.m3u8";
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const pem = privateKey.export({ type: "pkcs8", format: "pem" });
const env = {
  CLOUDFRONT_PUBLIC_KEY_ID: "TESTKEY",
  CLOUDFRONT_PRIVATE_ACCESS: pem,
};
const schema = Object.fromEntries(
  Object.entries({
    course: ["id", "isActive"],
    courseItem: ["id", "courseId", "mediaUrl"],
    user: ["id", "email", "isActive"],
    courseEnrolment: [
      "courseId",
      "userId",
      "enrolmentStatus",
      "createdAt",
      "id",
    ],
  }).map(([table, cols]) => [
    table,
    Object.fromEntries(cols.map((col) => [col, `${table}.${col}`])),
  ]),
);
const orm = {
  eq: (a, b) => ({ op: "eq", a, b }),
  and: (...args) => ({ op: "and", args }),
  desc: (a) => a,
};
function row(status = "enrolled", overrides = {}) {
  return {
    "course.id": ids.course,
    "course.isActive": true,
    "courseItem.id": ids.item,
    "courseItem.courseId": ids.course,
    "courseItem.mediaUrl": key,
    "user.id": "user1",
    "user.email": email,
    "user.isActive": true,
    "courseEnrolment.courseId": ids.course,
    "courseEnrolment.userId": "user1",
    "courseEnrolment.enrolmentStatus": status,
    "courseEnrolment.createdAt": 1,
    "courseEnrolment.id": "enrollment1",
    ...overrides,
  };
}
function service(rows = [row()], variables = env) {
  let calls = 0;
  const value = (v, r) => (Object.hasOwn(r, v) ? r[v] : v);
  const matches = (e, r) =>
    e.op === "and"
      ? e.args.every((a) => matches(a, r))
      : value(e.a, r) === value(e.b, r);
  const db = {
    select: (selection) => {
      calls++;
      let filters = [],
        order = [];
      const query = {
        from: () => query,
        innerJoin: (_, filter) => {
          filters.push(filter);
          return query;
        },
        leftJoin: () => query,
        where: (filter) => {
          filters.push(filter);
          return query;
        },
        orderBy: (...cols) => {
          order = cols;
          return query;
        },
        limit: async (count) =>
          rows
            .filter((r) => filters.every((f) => matches(f, r)))
            .sort((a, b) => {
              for (const col of order) {
                if (a[col] !== b[col]) return a[col] > b[col] ? -1 : 1;
              }
              return 0;
            })
            .slice(0, count)
            .map((r) =>
              Object.fromEntries(
                Object.entries(selection).map(([k, v]) => [k, r[v]]),
              ),
            ),
      };
      return query;
    },
  };
  return {
    ...load(
      "lib/coursePlaybackAccess.ts",
      {
        "server-only": {},
        "@aws-sdk/cloudfront-signer": signer,
        "node:crypto": crypto,
        "@/db": schema,
        "@/lib/dbConfig": { db },
        "drizzle-orm": orm,
        "@/lib/coursePlayback": playback,
        "@/lib/publicAsset": publicAssets,
        "@/lib/courseAccess": { isCourseId: (v) => /^[0-9a-f-]{36}$/i.test(v) },
        "@/lib/adminAccess": {
          getAdminAccessForEmail: (v) =>
            v === "admin@example.com"
              ? "full"
              : v === "blog@example.com"
                ? "blog"
                : null,
        },
      },
      { process: { env: variables } },
    ),
    calls: () => calls,
  };
}
const decode = (value) =>
  Buffer.from(
    value.replace(/-/g, "+").replace(/_/g, "=").replace(/~/g, "/"),
    "base64",
  );

test("signs only the selected HLS folder and verifies with the matching public key", async () => {
  const api = service();
  const grant = await api.grantCoursePlayback(ids.course, ids.item, email);
  assert.equal(api.calls(), 1);
  assert.equal(
    grant.mediaUrl,
    "https://media.rhhealthcaresimulation.com/course/transcoded/nrp/videos/Trauma%20Triage-001/index.m3u8",
  );
  const policy = decode(grant.cookies["CloudFront-Policy"]);
  const statement = JSON.parse(policy).Statement[0];
  assert.equal(statement.Resource, grant.mediaUrl.replace("index.m3u8", "*"));
  assert.equal(
    statement.Condition.DateLessThan["AWS:EpochTime"],
    grant.expiresAt,
  );
  assert.ok(
    grant.expiresAt - Math.floor(Date.now() / 1000) <= api.COURSE_GRANT_SECONDS,
  );
  assert.equal(
    crypto.verify(
      "RSA-SHA1",
      policy,
      publicKey,
      decode(grant.cookies["CloudFront-Signature"]),
    ),
    true,
  );
  assert.equal(
    crypto.verify(
      "RSA-SHA1",
      Buffer.from(policy.toString().replace("Trauma", "Other")),
      publicKey,
      decode(grant.cookies["CloudFront-Signature"]),
    ),
    false,
  );
});

test("document grants sign only the selected private file for five minutes", async () => {
  const api = service([
    row("enrolled", {
      "courseItem.mediaUrl": "course/resources/My+Notes%2B1.pdf",
    }),
  ]);
  const grant = await api.grantCourseDocument(ids.course, ids.item, email);
  const url = new URL(grant.mediaUrl);
  assert.equal(url.pathname, "/course/resources/My%20Notes%2B1.pdf");
  assert.equal(url.searchParams.get("Key-Pair-Id"), "TESTKEY");
  assert.equal(Number(url.searchParams.get("Expires")), grant.expiresAt);
  assert.ok(grant.expiresAt > Math.floor(Date.now() / 1000));
  assert.ok(grant.expiresAt - Math.floor(Date.now() / 1000) <= 300);
  const policy = JSON.stringify({
    Statement: [
      {
        Resource: `${url.origin}${url.pathname}`,
        Condition: { DateLessThan: { "AWS:EpochTime": grant.expiresAt } },
      },
    ],
  });
  assert.equal(
    crypto.verify(
      "RSA-SHA1",
      Buffer.from(policy),
      publicKey,
      decode(url.searchParams.get("Signature")),
    ),
    true,
  );
  const other = policy.replace("My%20Notes", "Other%20Notes");
  assert.equal(
    crypto.verify(
      "RSA-SHA1",
      Buffer.from(other),
      publicKey,
      decode(url.searchParams.get("Signature")),
    ),
    false,
  );
});

test("document grants reject invalid enrollment, other courses, public paths and traversal", async () => {
  for (const rows of [
    [],
    [row("pending")],
    [row("refunded")],
    [row("expired")],
    [row("enrolled", { "user.isActive": false })],
    [row("enrolled", { "course.isActive": false })],
    [row("enrolled", { "course.id": "other-course" })],
    [row("enrolled", { "user.email": "other@example.com" })],
  ]) {
    await assert.rejects(
      service(rows).grantCourseDocument(ids.course, ids.item, email),
      (e) => e.status === 403,
    );
  }
  for (const mediaUrl of [
    "public/course/notes.pdf",
    "course/a/../notes.pdf",
    "course/a/%252e%252e/notes.pdf",
  ]) {
    await assert.rejects(
      service([
        row("enrolled", { "courseItem.mediaUrl": mediaUrl }),
      ]).grantCourseDocument(ids.course, ids.item, email),
      (e) => e.status === 400,
    );
  }
  await assert.rejects(
    service().grantCourseDocument(ids.course, ids.item, email),
    (e) => e.status === 410,
  );
  await assert.rejects(
    service(
      [row("enrolled", { "courseItem.mediaUrl": "course/notes.pdf" })],
      {},
    ).grantCourseDocument(ids.course, ids.item, email),
    (e) => e.status === 503,
  );
});
test("MP4 grants cover exactly one file, including encoded wildcard and plus characters", async () => {
  const api = service([
    row("enrolled", { "courseItem.mediaUrl": "course/videos/A%2BB%2A%3F.mp4" }),
  ]);
  const grant = await api.grantCoursePlayback(ids.course, ids.item, email);
  const resource = JSON.parse(decode(grant.cookies["CloudFront-Policy"]))
    .Statement[0].Resource;
  assert.equal(
    resource,
    "https://media.rhhealthcaresimulation.com/course/videos/A%2BB%2A%3F.mp4",
  );
  assert.equal(grant.cookiePath, "/course/videos/A%2BB%2A%3F.mp4");
});
test("denies missing, pending, expired, refunded, inactive and cross-course access", async () => {
  for (const rows of [
    [],
    [row("pending")],
    [row("expired")],
    [row("refunded")],
    [row("enrolled", { "user.isActive": false })],
    [row("enrolled", { "course.isActive": false })],
    [row("enrolled", { "course.id": "other-course" })],
    [row("enrolled", { "user.email": "other@example.com" })],
  ]) {
    await assert.rejects(
      service(rows).grantCoursePlayback(ids.course, ids.item, email),
      (e) => e.status === 403,
    );
  }
});
test("a newer refund or expiry overrides a historical enrolled row", async () => {
  for (const status of ["refunded", "expired"]) {
    const api = service([
      row("enrolled"),
      row(status, { "courseEnrolment.createdAt": 2 }),
    ]);
    await assert.rejects(
      api.grantCoursePlayback(ids.course, ids.item, email),
      (e) => e.status === 403,
    );
    await assert.rejects(
      api.grantCourseDocument(ids.course, ids.item, email),
      (e) => e.status === 403,
    );
  }
});

function mobileDocumentRoute(
  rows = [row("enrolled", { "courseItem.mediaUrl": "course/notes.pdf" })],
) {
  const api = service(rows);
  return load(
    "app/api/auth/mobile/courses/[courseId]/documents/[itemId]/access/route.ts",
    {
      "next/server": {
        NextResponse: {
          json: (body, options) => new Response(JSON.stringify(body), options),
        },
      },
      "@/lib/mobileApiAuth": {
        getAuthenticatedApiEmail: async (request) =>
          request.headers.get("authorization") === "Bearer valid"
            ? email
            : null,
      },
      "@/lib/coursePlaybackAccess": api,
    },
  ).POST;
}

test("mobile documents require authentication and enrollment before exposing a signed URL", async () => {
  const handler = mobileDocumentRoute();
  const params = {
    params: Promise.resolve({ courseId: ids.course, itemId: ids.item }),
  };
  assert.equal((await handler(request(), params)).status, 401);
  assert.equal(
    (await handler(request({ Authorization: "Bearer invalid" }), params))
      .status,
    401,
  );
  const response = await handler(
    request({ Authorization: "Bearer valid" }),
    params,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  const grant = await response.json();
  assert.equal(new URL(grant.mediaUrl).pathname, "/course/notes.pdf");
  assert.equal(grant.cookies, undefined);
  assert.equal(
    (
      await mobileDocumentRoute([row("refunded")])(
        request({ Authorization: "Bearer valid" }),
        params,
      )
    ).status,
    403,
  );
});
test("rejects broad folder grants, traversal, encoded traversal and non-video media", async () => {
  for (const path of [
    "course/index.m3u8",
    "course/a/../b/index.m3u8",
    "course/a/%2e%2e/b/index.m3u8",
    "course/a/%252e%252e/b/index.m3u8",
    "course/a\\b/index.m3u8",
    "course/a/notes.pdf",
    "public/course/a/video.mp4",
    "https://media.rhhealthcaresimulation.com/course/a/../b/index.m3u8",
    "https://media.rhhealthcaresimulation.com/course/a/%2e%2e/b/index.m3u8",
  ]) {
    await assert.rejects(
      service([
        row("enrolled", { "courseItem.mediaUrl": path }),
      ]).grantCoursePlayback(ids.course, ids.item, email),
      (e) => e.status === 400,
    );
  }
});
test("escaped PEM newlines work and missing/invalid configuration fails closed", async () => {
  const grant = await service([row()], {
    ...env,
    CLOUDFRONT_PRIVATE_ACCESS: pem.replace(/\n/g, "\\n"),
  }).grantCoursePlayback(ids.course, ids.item, email);
  assert.ok(grant.cookies["CloudFront-Signature"]);
  for (const variables of [
    {},
    { ...env, CLOUDFRONT_PRIVATE_ACCESS: "invalid-key" },
  ]) {
    await assert.rejects(
      service([row()], variables).grantCoursePlayback(
        ids.course,
        ids.item,
        email,
      ),
      (e) => e.status === 503 && !e.message.includes("invalid-key"),
    );
  }
});
test("full admin previews require the explicit website-admin path; blog admin and mobile cannot bypass enrollment", async () => {
  const api = service();
  assert.ok(
    await api.grantCoursePlayback(
      ids.course,
      ids.item,
      "admin@example.com",
      true,
    ),
  );
  await assert.rejects(
    api.grantCoursePlayback(ids.course, ids.item, "admin@example.com", false),
    (e) => e.status === 403,
  );
  await assert.rejects(
    api.grantCoursePlayback(ids.course, ids.item, "blog@example.com", true),
    (e) => e.status === 403,
  );
});

function route(options = {}) {
  let signed = 0;
  class NextResponse extends Response {
    static json(data, init) {
      return new NextResponse(JSON.stringify(data), init);
    }
    cookies = {
      set: (name, value, attributes) => {
        this.headers.append(
          "Set-Cookie",
          `${name}=${value}; Domain=${attributes.domain}; Path=${attributes.path}; Max-Age=${attributes.maxAge}; Secure; HttpOnly; SameSite=Lax`,
        );
      },
    };
  }
  const api = service();
  const response = load("lib/coursePlaybackRoute.ts", {
    "server-only": {},
    "next/server": { NextResponse },
    "@/auth": {
      auth: async () =>
        options.session === false ? null : { user: { email } },
    },
    "@/lib/verify-token": {
      extractEmailFromToken: async (token) =>
        token === "valid" ? email : null,
    },
    "@/lib/coursePlaybackAccess": {
      ...api,
      grantCoursePlayback: async (...args) => {
        signed++;
        return api.grantCoursePlayback(...args);
      },
    },
  }).coursePlaybackResponse;
  return { response, signed: () => signed };
}
function request(
  headers = {},
  body = { courseItemId: ids.item },
  host = "www.rhhealthcaresimulation.com",
) {
  return new Request(`https://${host}/api/course/${ids.course}/access`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
test("website cookies are secure, HttpOnly and lesson scoped; cookie values are absent from JSON", async () => {
  const response = await route().response(request(), ids.course);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.cookies, undefined);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  const cookies = response.headers.getSetCookie();
  assert.equal(cookies.length, 3);
  for (const cookie of cookies) {
    assert.match(cookie, /Domain=rhhealthcaresimulation.com/);
    assert.match(
      cookie,
      /Path=\/course\/transcoded\/nrp\/videos\/Trauma%20Triage-001\//,
    );
    assert.match(cookie, /Secure; HttpOnly; SameSite=Lax/);
  }
});
test("native response includes cookies only after a valid bearer token, without browser Set-Cookie", async () => {
  const api = route();
  for (const headers of [{}, { Authorization: "Bearer invalid" }])
    assert.equal(
      (await api.response(request(headers), ids.course, true)).status,
      401,
    );
  assert.equal(api.signed(), 0);
  const response = await api.response(
    request({ Authorization: "Bearer valid" }),
    ids.course,
    true,
  );
  assert.ok((await response.json()).cookies["CloudFront-Policy"]);
  assert.equal(response.headers.get("set-cookie"), null);
});
test("anonymous, cross-origin, malformed and incompatible-domain website requests fail closed", async () => {
  assert.equal(
    (await route({ session: false }).response(request(), ids.course)).status,
    401,
  );
  assert.equal(
    (
      await route().response(
        request({ Origin: "https://evil.example" }),
        ids.course,
      )
    ).status,
    403,
  );
  assert.equal(
    (await route().response(request({}, {}), ids.course)).status,
    400,
  );
  assert.equal(
    (await route().response(request({}, undefined, "localhost"), ids.course))
      .status,
    503,
  );
});
