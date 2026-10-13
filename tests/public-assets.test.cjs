const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, modules = {}) {
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
    console,
    process: { env: { NEXT_PUBLIC_CLOUDFRONT_URL: "https://cdn.example", NEXT_PUBLIC_COURSE_CLOUDFRONT_URL: "https://cdn.example" } },
    require: (id) => {
      assert.ok(id in modules, `Unexpected dependency: ${id}`);
      return modules[id];
    },
  });
  return exports;
}
const cloudfront = load("lib/cloudfront.ts");
const media = load("lib/courseMedia.ts");
const assets = load("lib/publicAsset.ts", { "./cloudfront": cloudfront, "./courseMedia": media });
const s3 = load("lib/s3Asset.ts", { "./publicAsset": assets });

test("public media preserves folders and adds the prefix exactly once", () => {
  for (const key of [
    "website-image/Hero1.png",
    "workshops/banner/image.png",
    "blogs/banner.jpg",
    "certificates/completed.pdf",
    "courses/banner.jpg",
    "membership-cards/member/photo.jpg",
  ]) {
    assert.equal(assets.publicAssetKey(key), `public/${key}`);
    assert.equal(assets.publicAssetKey(`/public/${key}`), `public/${key}`);
    assert.equal(
      assets.publicAssetUrl(key),
      `https://cdn.example/public/${key}`,
    );
    assert.equal(
      assets.publicAssetUrl(`public/${key}`),
      `https://cdn.example/public/${key}`,
    );
    assert.equal(
      s3.getS3AssetUrl(`https://cdn.example/${key}`),
      `https://cdn.example/public/${key}`,
    );
  }
  assert.equal(assets.publicAssetUrl(""), "");
  assert.equal(assets.publicAssetUrl(null), "");
});

test("S3 and CDN URLs resolve to the same public object including encoded filenames", () => {
  const expected = "https://cdn.example/public/workshops/My%20Photo%2B1.png";
  for (const value of [
    "workshops/My Photo+1.png",
    "workshops/My%20Photo%2B1.png",
    "https://cdn.example/workshops/My%20Photo%2B1.png",
    "https://rh-healthcare.s3.ap-south-1.amazonaws.com/workshops/My%20Photo%2B1.png",
    "https://s3.ap-south-1.amazonaws.com/rh-healthcare/workshops/My%20Photo%2B1.png",
    "https://s3.amazonaws.com/rh-healthcare/workshops/My%20Photo%2B1.png",
  ])
    assert.equal(assets.publicAssetUrl(value), expected);
  assert.equal(
    assets.publicAssetUrl("https://external.example/image.png"),
    "https://external.example/image.png",
  );
});

test("course MP4, HLS and DASH video keys and URLs remain unchanged", () => {
  for (const [key, type] of [
    ["course/transcoded/topic/index.m3u8", "application/x-mpegURL"],
    ["course/videos/topic.mp4", "video/mp4"],
    ["courses/lesson", "video"],
    ["course/transcoded/topic/manifest.mpd", "application/dash+xml"],
  ]) {
    assert.equal(assets.courseAssetKey(key, type), key);
    assert.equal(
      assets.courseAssetUrl(key, type),
      cloudfront.cloudfrontAssetUrl(key),
    );
  }
  assert.equal(
    assets.courseAssetKey("course/notes.pdf", "pdf"),
    "public/course/notes.pdf",
  );
  assert.equal(
    assets.courseAssetUrl("public/course/notes.pdf", "document"),
    "https://cdn.example/public/course/notes.pdf",
  );
});

test("stored rich-text media is prefixed while course video and external links are preserved", () => {
  const html =
    '<img src="https://cdn.example/blogs/image.png"><a href="https://cdn.example/certificates/result.pdf">PDF</a><video src="https://cdn.example/course/video.mp4"></video><img src="https://external.example/image.png">';
  const result = assets.publicMediaHtml(html);
  assert.match(result, /cdn\.example\/public\/blogs\/image\.png/);
  assert.match(result, /cdn\.example\/public\/certificates\/result\.pdf/);
  assert.match(result, /cdn\.example\/course\/video\.mp4/);
  assert.match(result, /external\.example\/image\.png/);
  assert.equal(assets.publicMediaHtml(result), result);
});

test("membership photo ownership accepts old drafts and new public keys", () => {
  assert.equal(
    assets.isMembershipPhotoKey("membership-cards/member/photo.jpg", "member"),
    true,
  );
  assert.equal(
    assets.isMembershipPhotoKey(
      "public/membership-cards/member/photo.jpg",
      "member",
    ),
    true,
  );
  assert.equal(
    assets.isMembershipPhotoKey(
      "public/membership-cards/other/photo.jpg",
      "member",
    ),
    false,
  );
  assert.equal(
    assets.isMembershipPhotoKey(
      "membership-cards/member/../other/photo.jpg",
      "member",
    ),
    false,
  );
  assert.throws(
    () => assets.publicAssetKey("../secret.jpg"),
    /Invalid public media path/,
  );
});

test("admin workshop and blog uploads use public object keys", async () => {
  const commands = [];
  const actions = load("actions/uploadAction.ts", {
    "@aws-sdk/client-s3": {
      S3Client: class {},
      PutObjectCommand: class {
        constructor(input) {
          this.input = input;
        }
      },
    },
    "@/env": {
      AWS_ACCESS_KEY: "test",
      AWS_SECRET_KEY: "test",
      AWS_REGION: "test",
      AWS_BUCKET: "test",
    },
    "@aws-sdk/s3-request-presigner": {
      getSignedUrl: async (_client, command) => {
        commands.push(command.input);
        return "https://upload.example";
      },
    },
    "@/lib/adminAuth": { requireAdmin: async () => {} },
    "@/lib/publicAsset": assets,
  });
  await actions.getPresignedUrl("photo.png", "image/png", "workshops/banner");
  await actions.getPresignedUrl(
    "photo.png",
    "image/png",
    "public/workshops/gallery",
  );
  await actions.getBlogImagePresignedUrl("photo.png", "image/png");
  assert.match(commands[0].Key, /^public\/workshops\/banner\/\d+-photo\.png$/);
  assert.match(commands[1].Key, /^public\/workshops\/gallery\/\d+-photo\.png$/);
  assert.match(commands[2].Key, /^public\/blogs\/\d+-photo\.png$/);
});
