const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, dependencies = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
      {
        compilerOptions: { module: ts.ModuleKind.CommonJS },
      },
    ).outputText,
    {
      exports,
      require: (id) => {
        assert.ok(id in dependencies, `Unexpected dependency: ${id}`);
        return dependencies[id];
      },
    },
  );
  return exports;
}

const constants = load("lib/constants.ts");
const { validateInput } = load("lib/rhIdCard.ts", {
  "server-only": {},
  "drizzle-orm": {},
  "@/db/userSchema": {},
  "@/lib/publicAsset": {},
  "@/lib/dbConfig": {},
  "@/lib/constants": constants,
});
const { EMPTY_FORM_VALUES, makePreviewCard, formatProfession } = load(
  "components/id-card/idCardUtils.ts",
  { "@/lib/constants": constants },
);
const input = {
  fullName: "Member",
  mobileNumber: "9876543210",
  gender: "female",
  state: "Rajasthan",
  city: "Jaipur",
  profession: "other",
  qualification: "other",
  dateOfBirth: "1995-01-01",
  passportPhoto: "membership-cards/member/photo.jpg",
  termsAccepted: true,
};

test("custom profession is normalized and retained for Other", () => {
  const validated = validateInput({
    ...input,
    otherProfession: "  Physiotherapist  ",
  });
  assert.equal(validated.profession, "other");
  assert.equal(validated.otherProfession, "Physiotherapist");
  const preview = makePreviewCard({
    ...EMPTY_FORM_VALUES,
    profession: "other",
    otherProfession: " Physiotherapist ",
  });
  assert.equal(preview.otherProfession, "Physiotherapist");
  assert.equal(
    formatProfession(preview.profession, preview.otherProfession),
    "Physiotherapist",
  );
});

test("preset professions ignore stale custom details", () => {
  const validated = validateInput({
    ...input,
    profession: "nursing_officer",
    otherProfession: "Physiotherapist",
  });
  assert.equal(validated.otherProfession, null);
  const preview = makePreviewCard({
    ...EMPTY_FORM_VALUES,
    profession: "nursing_officer",
    otherProfession: "Physiotherapist",
  });
  assert.equal(preview.otherProfession, null);
  assert.equal(
    formatProfession(preview.profession, "Physiotherapist"),
    "Nursing Officer",
  );
});

test("custom profession length is bounded and older Other drafts remain valid", () => {
  assert.equal(
    validateInput({
      ...input,
      otherProfession: "x".repeat(
        constants.RH_CARD_OTHER_PROFESSION_MAX_LENGTH,
      ),
    }).otherProfession.length,
    120,
  );
  assert.throws(
    () => validateInput({ ...input, otherProfession: "x".repeat(121) }),
    /characters or fewer/,
  );
  assert.equal(validateInput(input).otherProfession, null);
  assert.equal(formatProfession("other", null), "Other");
});
