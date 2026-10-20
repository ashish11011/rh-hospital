import { RH_CARD_DISCOUNT_PERCENT } from "@/lib/constants";

export function getWorkshopPricing(originalAmount: number, member: boolean, couponDiscount = 0) {
  // Membership discount applies to the listed price and does not stack with coupons.
  const amount = member
    ? Math.round(originalAmount * (100 - RH_CARD_DISCOUNT_PERCENT) / 100)
    : Math.max(0, originalAmount - couponDiscount);
  return {
    amount,
    memberDiscount: member ? originalAmount - amount : 0,
    couponDiscount: member ? 0 : originalAmount - amount,
  };
}
