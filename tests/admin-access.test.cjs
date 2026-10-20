const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, dependencies = {}) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    URL,
    Response,
    console: { error() {} },
    require: (name) => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return exports;
}

const access = load("lib/adminAccess.ts");
const limitedEmail = "rhhealthcaresimulationcenter@gmail.com";
function authFor(email) {
  return load("lib/adminAuth.ts", {
    "@/auth": { auth: async () => (email ? { user: { email } } : null) },
    "@/lib/adminAccess": access,
    "next/navigation": {
      redirect: (url) => {
        throw new Error(`redirect:${url}`);
      },
    },
  });
}

test("only the configured accounts receive admin access, with normalized email matching", () => {
  assert.equal(
    access.getAdminAccessForEmail(`  ${limitedEmail.toUpperCase()} `),
    "content",
  );
  for (const email of ["rhhealthcare1@gmail.com", "bishnoi11011@gmail.com"]) {
    assert.equal(access.getAdminAccessForEmail(email), "full");
  }
  for (const email of [null, undefined, "", "visitor@example.com"]) {
    assert.equal(access.getAdminAccessForEmail(email), null);
    assert.equal(access.hasAdminPermission(null, "workshop"), false);
  }
});

test("limited admins can reach blogs, workshops and contacts, including contact exports", () => {
  for (const root of ["/admin", "/api/admin"]) {
    for (const section of ["blog", "workshop", "contact-enquiries"]) {
      for (const suffix of ["", "/", "/example"]) {
        assert.equal(
          access.canAccessAdminPath(`${root}/${section}${suffix}`, "content"),
          true,
        );
      }
    }
  }
  assert.equal(
    access.canAccessAdminPath("/api/admin/contact-enquiries/export", "content"),
    true,
  );
});

test("workshop registrations and unrelated admin routes remain blocked", () => {
  for (const root of ["/admin", "/api/admin"]) {
    for (const section of [
      "workshop-registration",
      "workshop-registration/export",
      "workshops",
      "blog-extra",
      "contact-enquiries-extra",
      "users",
      "payments",
      "payments/example",
      "rh-card",
      "course",
      "course-enrolments",
      "course-reviews",
      "seminar-registration",
      "generate-certificate",
    ]) {
      const pathname = `${root}/${section}`;
      assert.equal(
        access.canAccessAdminPath(pathname, "content"),
        false,
        pathname,
      );
      assert.equal(access.canAccessAdminPath(pathname, "full"), true, pathname);
    }
  }
  assert.equal(access.canAccessAdminPath("/admin", "content"), false);
});

test("server permission guards allow the requested sections and keep full admin operations restricted", async () => {
  const limited = authFor(limitedEmail);
  for (const permission of ["blog", "workshop", "contacts"]) {
    assert.equal((await limited.requireAdmin(permission)).access, "content");
    assert.equal(
      (await authFor("bishnoi11011@gmail.com").requireAdmin(permission)).access,
      "full",
    );
    await assert.rejects(
      authFor(null).requireAdmin(permission),
      /redirect:\/sign-in/,
    );
  }
  await assert.rejects(limited.requireAdmin("full"), /redirect:\/admin\/blog/);
  await assert.rejects(limited.requireAdmin(), /redirect:\/admin\/blog/);
});

test("proxy enforces route permissions for pages and APIs", () => {
  const proxy = load("proxy.ts", {
    "@/auth": { auth: (handler) => handler },
    "@/lib/adminAccess": access,
    "next/server": {
      NextResponse: {
        next: () => ({ status: 200 }),
        redirect: (url) => ({ status: 307, location: String(url) }),
        json: (body, options) => ({ ...options, body }),
      },
    },
  }).default;
  const request = (pathname, email = limitedEmail) =>
    proxy({
      nextUrl: { pathname },
      url: `https://example.com${pathname}`,
      auth: email ? { user: { email } } : null,
    });
  for (const pathname of [
    "/admin/workshop",
    "/admin/blog",
    "/admin/contact-enquiries",
    "/api/admin/contact-enquiries/export",
  ]) {
    assert.equal(request(pathname).status, 200);
  }
  assert.match(
    request("/admin/workshop-registration").location,
    /\/admin\/blog$/,
  );
  assert.equal(request("/api/admin/workshop-registration").status, 403);
  assert.match(request("/admin/payments").location, /\/admin\/blog$/);
  assert.equal(request("/admin/payments", "bishnoi11011@gmail.com").status, 200);
  assert.match(request("/admin/payments", null).location, /\/sign-in/);
  assert.equal(
    request("/api/admin/contact-enquiries/export", null).status,
    401,
  );
  assert.match(request("/admin").location, /\/admin\/blog$/);
  assert.equal(
    request("/admin/workshop-registration", "bishnoi11011@gmail.com").status,
    200,
  );
});

test("workshop operations work for the limited admin while registration queries stay protected", async () => {
  let operations = 0;
  const workshopInput = { attendanceMode: "both", onlinePrice: 100, offlinePrice: 200 };
  const query = {
    values: async () => {
      operations++;
    },
    set: () => query,
    where: () => query,
    from: () => query,
    orderBy: async () => {
      operations++;
      return [];
    },
    then: (resolve) => {
      operations++;
      return Promise.resolve([workshopInput]).then(resolve);
    },
  };
  const dependencies = {
    "@/lib/adminAuth": authFor(limitedEmail),
    "@/lib/workshopAttendance": load("lib/workshopAttendance.ts"),
    "@/lib/dbConfig": {
      db: {
        insert: () => query,
        update: () => query,
        delete: () => query,
        select: () => query,
      },
    },
    "@/db/index": { workshop: {}, workshopImage: {}, workshopRegistration: {} },
    "drizzle-orm": { eq() {}, desc() {} },
    "next/cache": { revalidatePath() {} },
  };
  const workshop = load("actions/workshopActions.ts", dependencies);
  for (const [name, args] of [
    ["createWorkshop", [workshopInput]],
    ["updateWorkshop", ["id", {}]],
    ["deleteWorkshop", ["id"]],
    ["addWorkshopImage", [{ workshopId: "id", image: "image.png" }]],
    ["deleteWorkshopImage", ["id"]],
  ]) {
    assert.equal((await workshop[name](...args)).success, true, name);
  }
  await workshop.getWorkshopImages("id");
  assert.equal(operations, 7);
  const registration = load("actions/registrationActions.ts", dependencies);
  await registration.getRegistrations({});
  await registration.getAllRegistrations();
  await registration.getWorkshopsList();
  assert.equal(
    operations,
    7,
    "registration actions must not access the database",
  );
});

test("contact export authorizes the limited admin and rejects other users before querying", async () => {
  for (const email of [
    limitedEmail,
    "bishnoi11011@gmail.com",
    "visitor@example.com",
    null,
  ]) {
    let queries = 0;
    const query = {
      from: () => query,
      orderBy: async () => {
        queries++;
        return [];
      },
    };
    const route = load("app/api/admin/contact-enquiries/export/route.ts", {
      "@/lib/adminAuth": authFor(email),
      "@/lib/adminAccess": access,
      "@/db": { contact: {} },
      "drizzle-orm": { desc() {}, sql() {} },
      "@/lib/dbConfig": { db: { select: () => query } },
      "@/lib/contactEnquiriesCsv": {
        contactEnquiriesCsv: () => "Name,Email\r\n",
      },
    });
    const response = await route.GET();
    const allowed =
      email === limitedEmail || email === "bishnoi11011@gmail.com";
    assert.equal(response.status, allowed ? 200 : 401);
    assert.equal(queries, allowed ? 1 : 0);
  }
});

test("limited admins can upload workshop images only to banner and gallery folders", async () => {
  const signed = [];
  const dependencies = {
    "@/lib/adminAuth": authFor(limitedEmail),
    "@/env": {},
    "@aws-sdk/client-s3": {
      S3Client: class {},
      PutObjectCommand: class {
        constructor(input) {
          this.input = input;
        }
      },
    },
    "@aws-sdk/s3-request-presigner": {
      getSignedUrl: async (_, command) => {
        signed.push(command.input);
        return "https://upload.example";
      },
    },
    "@/lib/publicAsset": { publicAssetKey: (key) => `public/${key}` },
  };
  const uploads = load("actions/uploadAction.ts", dependencies);
  for (const kind of ["banner", "gallery"]) {
    const result = await uploads.getWorkshopImagePresignedUrl(
      "photo.png",
      "image/png",
      kind,
    );
    assert.match(
      result.key,
      new RegExp(`^public/workshops/${kind}/[0-9]+-photo.png$`),
    );
  }
  assert.ok(
    (
      await uploads.getWorkshopImagePresignedUrl(
        "file.mp4",
        "video/mp4",
        "banner",
      )
    ).error,
  );
  assert.ok(
    (
      await uploads.getWorkshopImagePresignedUrl(
        "file.png",
        "image/png",
        "../courses",
      )
    ).error,
  );
  assert.ok(
    (await uploads.getPresignedUrl("file.png", "image/png", "courses")).error,
  );
  const anonymous = load("actions/uploadAction.ts", {
    ...dependencies,
    "@/lib/adminAuth": authFor(null),
  });
  assert.ok(
    (
      await anonymous.getWorkshopImagePresignedUrl(
        "file.png",
        "image/png",
        "banner",
      )
    ).error,
  );
  assert.equal(signed.length, 2);
});
