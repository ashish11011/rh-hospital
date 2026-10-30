export const COURSE_ITEM_ACCESS_TYPES = [
  "free",
  "paid",
  "free_for_members",
] as const;
export type CourseItemAccessType = (typeof COURSE_ITEM_ACCESS_TYPES)[number];

export const COURSE_ITEM_ACCESS_LABELS: Record<CourseItemAccessType, string> = {
  free: "Free",
  paid: "Paid",
  free_for_members: "Members only",
};

export function hasActiveRhMembership(
  card: {
    isActive: boolean;
    activationDate: Date | null;
    validityDate: Date | null;
  } | null,
  now = new Date(),
) {
  return Boolean(
    card?.isActive &&
    card.activationDate &&
    card.activationDate <= now &&
    card.validityDate &&
    card.validityDate > now,
  );
}

export function canAccessCourseItem(
  accessType: string | null | undefined,
  {
    isLoggedIn = false,
    isEnrolled = false,
    isMember = false,
  }: { isLoggedIn?: boolean; isEnrolled?: boolean; isMember?: boolean } = {},
) {
  return (
    isLoggedIn &&
    (isEnrolled ||
      accessType === "free" ||
      (accessType === "free_for_members" && isMember))
  );
}

export function parseCourseItemAccessType(
  value: unknown,
): CourseItemAccessType {
  if (value === undefined) return "paid";
  if (!COURSE_ITEM_ACCESS_TYPES.includes(value as CourseItemAccessType)) {
    throw new Error("Invalid course item access type");
  }
  return value as CourseItemAccessType;
}
