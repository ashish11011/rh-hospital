import "server-only";

import { getLatestUserCard } from "@/lib/rhIdCard";
import { isRhCardDiscountEligible } from "@/lib/rhCardDiscount";

export async function getRhCardDiscountCard(userId?: string) {
  if (!userId) return null;
  const card = await getLatestUserCard(userId);
  return isRhCardDiscountEligible(card) ? card : null;
}
