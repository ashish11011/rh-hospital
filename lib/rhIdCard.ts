import "server-only";
import { desc, eq } from "drizzle-orm";
import { userCardSchema } from "@/db/userSchema";
import { publicAssetUrl } from "@/lib/publicAsset";
import { db } from "@/lib/dbConfig";
import { RH_CARD_OTHER_PROFESSION_MAX_LENGTH } from "@/lib/constants";

const GENDER_VALUES = ["male", "female", "other"] as const;
const BLOOD_GROUP_VALUES = ["A", "B", "AB", "O"] as const;
const RH_FACTOR_VALUES = ["positive", "negative"] as const;
const PROFESSION_VALUES = [
  "nursing_student",
  "nursing_officer",
  "nursing_tutor",
  "assistant_professor",
  "associate_professor",
  "professor",
  "principal",
  "hospital_administrator",
  "other",
] as const;
const QUALIFICATION_VALUES = [
  "anm",
  "gnm",
  "bsc_nursing",
  "pbbsc_nursing",
  "msc_nursing",
  "phd",
  "other",
] as const;

export type UserCard = typeof userCardSchema.$inferSelect;
type GenderValue = (typeof GENDER_VALUES)[number];
type BloodGroupValue = (typeof BLOOD_GROUP_VALUES)[number];
type RhFactorValue = (typeof RH_FACTOR_VALUES)[number];
type ProfessionValue = (typeof PROFESSION_VALUES)[number];
type QualificationValue = (typeof QUALIFICATION_VALUES)[number];
export type UserCardInput = {
  fullName?: unknown;
  mobileNumber?: unknown;
  gender?: unknown;
  bloodGroup?: unknown;
  rhFactor?: unknown;
  dateOfBirth?: unknown;
  state?: unknown;
  city?: unknown;
  profession?: unknown;
  otherProfession?: unknown;
  qualification?: unknown;
  organizationName?: unknown;
  passportPhoto?: unknown;
  referralCode?: unknown;
  hearAboutRh?: unknown;
  termsAccepted?: unknown;
};
export type ValidatedUserCardInput = {
  fullName: string;
  mobileNumber: string;
  gender: GenderValue;
  bloodGroup: BloodGroupValue | null;
  rhFactor: RhFactorValue | null;
  dateOfBirth: Date | null;
  state: string;
  city: string;
  profession: ProfessionValue;
  otherProfession: string | null;
  qualification: QualificationValue;
  organizationName: string | null;
  passportPhoto: string | null;
  referralCode: string | null;
  hearAboutRh: string | null;
  termsAccepted: true;
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value: unknown) {
  const cleaned = cleanString(value);
  return cleaned.length > 0 ? cleaned : null;
}

function parseOptionalDate(value: unknown) {
  const cleaned = cleanString(value);
  if (!cleaned) return null;

  const date = new Date(`${cleaned}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(cleaned) ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== cleaned
  ) {
    throw new Error("Date of birth must be a valid date in YYYY-MM-DD format");
  }

  return date;
}

export function addYears(date: Date, years: number) {
  const nextDate = new Date(date);
  nextDate.setFullYear(nextDate.getFullYear() + years);
  return nextDate;
}

function getProfessionCode(profession: string) {
  const codeMap: Record<string, string> = {
    nursing_student: "NST",
    nursing_officer: "NUR",
    nursing_tutor: "NTU",
    assistant_professor: "APR",
    associate_professor: "ASP",
    professor: "PRO",
    principal: "PRI",
    hospital_administrator: "HAD",
    other: "MEM",
  };

  return codeMap[profession] || "MEM";
}

export function buildMemberShipId(
  card: Pick<
    UserCard,
    "memberShipNumber" | "profession" | "activationDate" | "createdAt"
  >,
) {
  const activationDate = card.activationDate || card.createdAt || new Date();
  const year = new Date(activationDate).getFullYear();
  const sequence = String(card.memberShipNumber).padStart(4, "0");

  return `RH-${getProfessionCode(card.profession)}-${year}-${sequence}`;
}

export function serializeCard(card: UserCard) {
  return {
    ...card,
    passportPhotoUrl: publicAssetUrl(card.passportPhoto) || null,
    dateOfBirth: card.dateOfBirth?.toISOString() || null,
    activationDate: card.activationDate?.toISOString() || null,
    validityDate: card.validityDate?.toISOString() || null,
    createdAt: card.createdAt?.toISOString() || null,
    updatedAt: card.updatedAt?.toISOString() || null,
  };
}

function isOneOf<T extends readonly string[]>(
  value: unknown,
  allowedValues: T,
): value is T[number] {
  return typeof value === "string" && allowedValues.includes(value);
}

export function validateInput(body: UserCardInput): ValidatedUserCardInput {
  const fullName = cleanString(body.fullName);
  const mobileNumber = cleanString(body.mobileNumber);
  const state = cleanString(body.state);
  const city = cleanString(body.city);
  const gender = body.gender;
  const profession = body.profession;
  const qualification = body.qualification;

  if (!fullName) throw new Error("Full name is required");
  if (!mobileNumber) throw new Error("Mobile number is required");
  if (!state) throw new Error("State is required");
  if (!city) throw new Error("City is required");
  if (body.termsAccepted !== true) throw new Error("Terms must be accepted");
  if (!isOneOf(gender, GENDER_VALUES)) throw new Error("Gender is invalid");
  if (!isOneOf(profession, PROFESSION_VALUES))
    throw new Error("Profession is invalid");
  // Older card drafts and mobile clients may not supply a custom profession.
  const otherProfession =
    profession === "other" ? optionalString(body.otherProfession) : null;
  if (
    otherProfession &&
    otherProfession.length > RH_CARD_OTHER_PROFESSION_MAX_LENGTH
  )
    throw new Error(
      `Profession details must be ${RH_CARD_OTHER_PROFESSION_MAX_LENGTH} characters or fewer`,
    );
  if (!isOneOf(qualification, QUALIFICATION_VALUES))
    throw new Error("Qualification is invalid");

  const rawBloodGroup = optionalString(body.bloodGroup);
  const rawRhFactor = optionalString(body.rhFactor);
  let bloodGroup: BloodGroupValue | null = null;
  let rhFactor: RhFactorValue | null = null;

  if (rawBloodGroup) {
    if (!isOneOf(rawBloodGroup, BLOOD_GROUP_VALUES)) {
      throw new Error("Blood group is invalid");
    }
    bloodGroup = rawBloodGroup;
  }
  if (rawRhFactor) {
    if (!isOneOf(rawRhFactor, RH_FACTOR_VALUES)) {
      throw new Error("RH factor is invalid");
    }
    rhFactor = rawRhFactor;
  }

  const dateOfBirth = parseOptionalDate(body.dateOfBirth);
  const passportPhoto = optionalString(body.passportPhoto);
  if (!dateOfBirth) throw new Error("Date of birth is required");
  if (dateOfBirth > new Date())
    throw new Error("Date of birth cannot be in the future");
  if (!passportPhoto) throw new Error("Passport photo is required");

  if (passportPhoto && /^https?:\/\//i.test(passportPhoto)) {
    throw new Error(
      "Passport photo must be uploaded before generating the card",
    );
  }

  return {
    fullName,
    mobileNumber,
    gender,
    bloodGroup,
    rhFactor,
    dateOfBirth,
    state,
    city,
    profession,
    otherProfession,
    qualification,
    organizationName: optionalString(body.organizationName),
    passportPhoto,
    referralCode: optionalString(body.referralCode),
    hearAboutRh: optionalString(body.hearAboutRh),
    termsAccepted: true,
  };
}

export async function getLatestUserCard(userId: string) {
  const [card] = await db
    .select()
    .from(userCardSchema)
    .where(eq(userCardSchema.userId, userId))
    .orderBy(desc(userCardSchema.createdAt))
    .limit(1);

  return card || null;
}
