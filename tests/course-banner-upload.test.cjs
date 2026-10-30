const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");

function setup({
  initialData,
  upload = async () => ({ ok: true }),
  presignError,
} = {}) {
  const states = [],
    presigns = [],
    requests = [],
    saves = [];
  let cursor = 0;
  const key = "public/courses/banners/123-banner.png";
  const mocks = {
    react: {
      ...React,
      useState(initial) {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [
          states[index],
          (value) => {
            states[index] =
              typeof value === "function" ? value(states[index]) : value;
          },
        ];
      },
    },
    "next/navigation": { useRouter: () => ({ refresh() {} }) },
    "next/image": { __esModule: true, default: "Image" },
    "@/actions/courseAdminActions": {
      createCourse: async (data) => {
        saves.push(data);
        return { id: "new-course" };
      },
      updateCourse: async (id, data) => {
        saves.push({ id, ...data });
      },
    },
    "@/actions/uploadAction": {
      getPresignedUrl: async (...args) => {
        presigns.push(args);
        return presignError
          ? { error: presignError }
          : { uploadUrl: "https://upload.example/banner", key };
      },
    },
    "@/lib/publicAsset": {
      publicAssetKey: (value) =>
        value ? (value.startsWith("public/") ? value : `public/${value}`) : "",
      publicAssetUrl: (value) => `https://cdn.example/${value}`,
    },
    "@/components/ui/button": { Button: "Button" },
    "@/components/ui/checkbox": { Checkbox: "Checkbox" },
    "@/components/ui/input": { Input: "Input" },
    "@/components/ui/label": { Label: "Label" },
    "@/components/ui/textarea": { Textarea: "Textarea" },
  };
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(
      path.join(__dirname, "../components/admin/CourseForm.tsx"),
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
  new Function("require", "exports", "fetch", code)(
    (name) => (name in mocks ? mocks[name] : require(name)),
    exports,
    async (...args) => {
      requests.push(args);
      return upload(...args);
    },
  );
  function render() {
    cursor = 0;
    return exports.CourseForm({ initialData });
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
    key,
    presigns,
    requests,
    saves,
    elements,
    submit: () => render().props.onSubmit({ preventDefault() {} }),
    select: (file = { name: "banner.png", type: "image/png" }) =>
      elements("Input")
        .find((node) => node.props.type === "file")
        .props.onChange({
          currentTarget: { files: [file], value: "banner.png" },
        }),
  };
}

test("course banners reuse the existing presigner and save the public S3 key only after upload succeeds", async () => {
  const app = setup();
  assert.equal(app.elements("Button")[0].props.disabled, true);
  await app.select();
  assert.deepEqual(app.presigns, [
    ["banner.png", "image/png", "courses/banners"],
  ]);
  assert.equal(app.requests[0][0], "https://upload.example/banner");
  assert.equal(app.requests[0][1].method, "PUT");
  assert.equal(app.requests[0][1].headers["Content-Type"], "image/png");
  assert.equal(
    app.elements("Image")[0].props.src,
    `https://cdn.example/${app.key}`,
  );
  await app.submit();
  assert.equal(app.saves[0].bannerImageUrl, app.key);
});

test("failed replacement uploads retain the existing course banner", async () => {
  const app = setup({
    initialData: {
      id: "course",
      bannerImageUrl: "public/courses/original.png",
    },
    upload: async () => ({ ok: false }),
  });
  await app.select();
  assert.match(
    app.elements("p").find((node) => node.props.role === "alert").props
      .children,
    /Unable to upload/,
  );
  await app.submit();
  assert.equal(app.saves[0].bannerImageUrl, "public/courses/original.png");
});

test("admin course editing loads and saves the separate iOS price and product ID", async () => {
  const app = setup({
    initialData: {
      id: "course",
      bannerImageUrl: "public/banner.png",
      iosPrice: "1499.50",
      iosProductId: "com.rh.nrp",
    },
  });
  const price = app
    .elements("Input")
    .find((node) => node.props.placeholder === "1499.00");
  assert.equal(price.props.value, "1499.50");
  price.props.onChange({ target: { value: "1599.99" } });
  app
    .elements("Input")
    .find((node) => node.props.placeholder === "com.rhhealthcare.course.nrp")
    .props.onChange({ target: { value: "com.rh.course.updated" } });
  await app.submit();
  assert.equal(app.saves[0].iosPrice, 1599.99);
  assert.equal(app.saves[0].iosProductId, "com.rh.course.updated");
});

test("course creation is blocked while a banner upload is in progress", async () => {
  let finishUpload;
  const app = setup({
    upload: () =>
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
  });
  const pending = app.select();
  await Promise.resolve();
  assert.equal(app.elements("Button")[0].props.disabled, true);
  await app.submit();
  assert.equal(app.saves.length, 0);
  finishUpload({ ok: true });
  await pending;
  assert.equal(app.elements("Button")[0].props.disabled, false);
});

test("invalid files and presigner failures cannot create a banner or save a new course", async () => {
  for (const options of [
    { file: { name: "notes.pdf", type: "application/pdf" } },
    { presignError: "Upload not authorized" },
  ]) {
    const app = setup(options);
    await app.select(options.file);
    await app.submit();
    assert.equal(app.requests.length, 0);
    assert.equal(app.saves.length, 0);
    assert.equal(app.elements("Image").length, 0);
    assert.equal(app.elements("Button")[0].props.disabled, true);
  }
});
