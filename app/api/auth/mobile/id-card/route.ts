import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { userCardSchema, userSchema } from "@/db/userSchema";
import { cloudfrontAssetUrl } from "@/lib/cloudfront";
import { db } from "@/lib/dbConfig";
import { getAuthenticatedApiEmail } from "@/lib/mobileApiAuth";

export const dynamic = "force-dynamic";

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

type UserCard = typeof userCardSchema.$inferSelect;
type GenderValue = (typeof GENDER_VALUES)[number];
type BloodGroupValue = (typeof BLOOD_GROUP_VALUES)[number];
type RhFactorValue = (typeof RH_FACTOR_VALUES)[number];
type ProfessionValue = (typeof PROFESSION_VALUES)[number];
type QualificationValue = (typeof QUALIFICATION_VALUES)[number];
type UserCardInput = {
  fullName?: unknown;
  mobileNumber?: unknown;
  gender?: unknown;
  bloodGroup?: unknown;
  rhFactor?: unknown;
  dateOfBirth?: unknown;
  state?: unknown;
  city?: unknown;
  profession?: unknown;
  qualification?: unknown;
  organizationName?: unknown;
  passportPhoto?: unknown;
  referralCode?: unknown;
  hearAboutRh?: unknown;
  termsAccepted?: unknown;
};
type ValidatedUserCardInput = {
  fullName: string;
  mobileNumber: string;
  gender: GenderValue;
  bloodGroup: BloodGroupValue | null;
  rhFactor: RhFactorValue | null;
  dateOfBirth: Date | null;
  state: string;
  city: string;
  profession: ProfessionValue;
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
  if (Number.isNaN(date.getTime())) {
    throw new Error("Date of birth must be a valid date in YYYY-MM-DD format");
  }

  return date;
}

function addYears(date: Date, years: number) {
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

function buildMemberShipId(
  card: Pick<
    UserCard,
    "memberShipNumber" | "profession" | "activationDate" | "createdAt"
  >,
) {
  const activationDate = card.activationDate || card.createdAt || new Date();
  const year = new Date(activationDate).getFullYear();
  const sequence = String(card.memberShipNumber).padStart(6, "0");

  return `RH-${getProfessionCode(card.profession)}-${year}-${sequence}`;
}

function serializeCard(card: UserCard) {
  return {
    ...card,
    passportPhotoUrl: cloudfrontAssetUrl(card.passportPhoto) || null,
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

function validateInput(body: UserCardInput): ValidatedUserCardInput {
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
    qualification,
    organizationName: optionalString(body.organizationName),
    passportPhoto,
    referralCode: optionalString(body.referralCode),
    hearAboutRh: optionalString(body.hearAboutRh),
    termsAccepted: true,
  };
}

async function getAuthenticatedUser(req: Request) {
  const email = await getAuthenticatedApiEmail(req);

  if (!email) return null;

  const [account] = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.email, email))
    .limit(1);

  return account || null;
}

async function getLatestUserCard(userId: string) {
  const [card] = await db
    .select()
    .from(userCardSchema)
    .where(eq(userCardSchema.userId, userId))
    .orderBy(desc(userCardSchema.createdAt))
    .limit(1);

  return card || null;
}

async function ensureMemberShipId(card: UserCard) {
  if (card.memberShipId) return card;

  const memberShipId = buildMemberShipId(card);
  const [updatedCard] = await db
    .update(userCardSchema)
    .set({ memberShipId, updatedAt: new Date() })
    .where(eq(userCardSchema.id, card.id))
    .returning();

  return updatedCard || { ...card, memberShipId };
}

export async function GET(req: Request) {
  try {
    const account = await getAuthenticatedUser(req);

    if (!account) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token or session" },
        { status: 401 },
      );
    }

    const card = await getLatestUserCard(account.id);
    const cardWithMemberShipId = card ? await ensureMemberShipId(card) : null;

    return NextResponse.json(
      {
        success: true,
        card: cardWithMemberShipId ? serializeCard(cardWithMemberShipId) : null,
        defaults: {
          fullName: account.name || "",
          mobileNumber: account.mobileNumber || "",
          email: account.email || "",
          city: account.city || "",
          organizationName: account.instituteName || "",
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch membership card" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const account = await getAuthenticatedUser(req);

    if (!account) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token or session" },
        { status: 401 },
      );
    }

    const existingCard = await getLatestUserCard(account.id);
    if (existingCard) {
      const cardWithMemberShipId = await ensureMemberShipId(existingCard);
      return NextResponse.json(
        {
          success: true,
          card: serializeCard(cardWithMemberShipId),
          message: "Membership card already exists",
        },
        { status: 200 },
      );
    }

    const input = validateInput((await req.json()) as UserCardInput);
    if (
      input.passportPhoto &&
      !input.passportPhoto.startsWith(`membership-cards/${account.id}/`)
    ) {
      return NextResponse.json(
        { error: "Passport photo must be uploaded before generating the card" },
        { status: 400 },
      );
    }

    const activationDate = new Date();
    const validityDate = addYears(activationDate, 2);

    const [createdCard] = await db
      .insert(userCardSchema)
      .values({
        userId: account.id,
        memberShipType: "temporary",
        fullName: input.fullName,
        mobileNumber: input.mobileNumber,
        email: account.email,
        gender: input.gender,
        bloodGroup: input.bloodGroup,
        rhFactor: input.rhFactor,
        dateOfBirth: input.dateOfBirth,
        state: input.state,
        city: input.city,
        profession: input.profession,
        qualification: input.qualification,
        organizationName: input.organizationName,
        passportPhoto: input.passportPhoto,
        referralCode: input.referralCode,
        hearAboutRh: input.hearAboutRh,
        termsAccepted: input.termsAccepted,
        activationDate,
        validityDate,
        cardType: "free",
        isActive: true,
        membershipPurchaseType: "free",
      })
      .returning();

    const cardWithMemberShipId = await ensureMemberShipId(createdCard);

    return NextResponse.json(
      {
        success: true,
        card: serializeCard(cardWithMemberShipId),
        message: "Membership card generated successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate membership card" },
      { status: 400 },
    );
  }
}
