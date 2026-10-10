import type { IdCardFormValues, UserCardRecord } from "./types";

export const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
] as const;
export const BLOOD_GROUP_OPTIONS = ["A", "B", "AB", "O"].map((value) => ({
  label: value,
  value,
}));
export const RH_FACTOR_OPTIONS = [
  { label: "Positive", value: "positive" },
  { label: "Negative", value: "negative" },
] as const;
export const PROFESSION_OPTIONS = [
  { label: "Nursing Student", value: "nursing_student" },
  { label: "Nursing Officer", value: "nursing_officer" },
  { label: "Nursing Tutor", value: "nursing_tutor" },
  { label: "Assistant Professor", value: "assistant_professor" },
  { label: "Associate Professor", value: "associate_professor" },
  { label: "Professor", value: "professor" },
  { label: "Principal", value: "principal" },
  { label: "Hospital Administrator", value: "hospital_administrator" },
  { label: "Other", value: "other" },
] as const;
export const QUALIFICATION_OPTIONS = [
  { label: "ANM", value: "anm" },
  { label: "GNM", value: "gnm" },
  { label: "B.Sc Nursing", value: "bsc_nursing" },
  { label: "P.B.B.Sc Nursing", value: "pbbsc_nursing" },
  { label: "M.Sc Nursing", value: "msc_nursing" },
  { label: "PhD", value: "phd" },
  { label: "Other", value: "other" },
] as const;

export const EMPTY_FORM_VALUES: IdCardFormValues = {
  fullName: "",
  email: "",
  mobileNumber: "",
  gender: "",
  bloodGroup: "",
  rhFactor: "",
  dateOfBirth: "",
  state: "",
  city: "",
  profession: "",
  qualification: "",
  organizationName: "",
  passportPhoto: "",
  passportPhotoUrl: "",
  referralCode: "",
  hearAboutRh: "",
  termsAccepted: false,
};

export function formatCardDate(value: string | null) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatProfession(value: string) {
  return (
    PROFESSION_OPTIONS.find((option) => option.value === value)?.label ||
    "Member"
  );
}

export function getCardStatus(card: UserCardRecord) {
  if (!card.isActive) return "Inactive";
  if (card.validityDate && new Date(card.validityDate).getTime() < Date.now())
    return "Expired";
  return "Active";
}

export function makePreviewCard(values: IdCardFormValues): UserCardRecord {
  const now = new Date();
  const validity = new Date(now);
  validity.setFullYear(validity.getFullYear() + 1);
  return {
    ...values,
    id: "preview",
    userId: "preview",
    memberShipNumber: 0,
    memberShipId: "Assigned after creation",
    memberShipType: "temporary",
    gender: values.gender || "other",
    profession: values.profession || "other",
    qualification: values.qualification || "other",
    bloodGroup: values.bloodGroup || null,
    rhFactor: values.rhFactor || null,
    dateOfBirth: values.dateOfBirth || null,
    cardType: "paid",
    membershipPurchaseType: "paid",
    isActive: true,
    activationDate: now.toISOString(),
    validityDate: validity.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}
