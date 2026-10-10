import { RH_CARD_DISCOUNT_PERCENT } from "@/lib/constants";
import type { UserCard } from "@/lib/rhIdCard";

type DiscountCard = Pick<
  UserCard,
  "isActive" | "membershipPurchaseType" | "activationDate" | "validityDate"
>;

export function isRhCardDiscountEligible(
  card: DiscountCard | null,
  now = new Date(),
) {
  return Boolean(
    card?.isActive &&
    card.membershipPurchaseType === "paid" &&
    card.activationDate &&
    card.activationDate.getTime() <= now.getTime() &&
    card.validityDate &&
    card.validityDate.getTime() > now.getTime(),
  );
}

export function getRhCardCoursePricing(
  originalAmount: number,
  eligible: boolean,
) {
  const discountPercent =
    eligible && originalAmount > 0 ? RH_CARD_DISCOUNT_PERCENT : 0;
  // Course and payment amounts are stored as whole rupees.
  const amount = Math.round((originalAmount * (100 - discountPercent)) / 100);
  return { originalAmount, amount, discountPercent };
}

export type CoursePricing = ReturnType<typeof getRhCardCoursePricing>;
