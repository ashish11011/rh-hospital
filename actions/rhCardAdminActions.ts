"use server";

import { payment, userCard } from "@/db";
import { db } from "@/lib/dbConfig";
import { requireAdmin } from "@/lib/adminAuth";
import { serializeCard } from "@/lib/rhIdCard";
import { and, count, desc, eq, ilike, lt, gte, or, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const PAGE_SIZE = 20;
const CARD_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getAdminRhCards({
  page = 1,
  search = "",
  status = "",
}: {
  page?: number;
  search?: string;
  status?: string;
} = {}) {
  await requireAdmin("full");
  const term = search.trim().slice(0, 200);
  const now = new Date();
  const statusCondition =
    status === "active"
      ? and(
          eq(userCard.isActive, true),
          or(isNull(userCard.validityDate), gte(userCard.validityDate, now)),
        )
      : status === "expired"
        ? and(eq(userCard.isActive, true), lt(userCard.validityDate, now))
        : status === "inactive"
          ? eq(userCard.isActive, false)
          : undefined;
  const condition = and(
    term
      ? or(
          ilike(userCard.fullName, `%${term}%`),
          ilike(userCard.email, `%${term}%`),
          ilike(userCard.mobileNumber, `%${term}%`),
          ilike(userCard.memberShipId, `%${term}%`),
        )
      : undefined,
    statusCondition,
  );
  const [{ total }] = await db
    .select({ total: count() })
    .from(userCard)
    .where(condition);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(
    pageCount,
    Number.isSafeInteger(page) && page > 0 ? page : 1,
  );
  const cards = await db
    .select()
    .from(userCard)
    .where(condition)
    .orderBy(desc(userCard.createdAt), desc(userCard.id))
    .limit(PAGE_SIZE)
    .offset((currentPage - 1) * PAGE_SIZE);

  return {
    cards: cards.map(serializeCard),
    total,
    page: currentPage,
    pageCount,
    limit: PAGE_SIZE,
  };
}

export async function getAdminRhCard(id: string) {
  await requireAdmin("full");
  if (!CARD_ID_PATTERN.test(id)) return null;
  const [card] = await db
    .select()
    .from(userCard)
    .where(eq(userCard.id, id))
    .limit(1);
  if (!card) return null;
  const payments = await db
    .select({
      id: payment.id,
      gatewayOrderId: payment.gatewayOrderId,
      amount: payment.amount,
      amountPaid: payment.amountPaid,
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
    })
    .from(payment)
    .where(and(eq(payment.orderType, "product"), eq(payment.orderId, card.id)))
    .orderBy(desc(payment.createdAt), desc(payment.id));

  return {
    card: serializeCard(card),
    payments: payments.map((record) => ({
      ...record,
      createdAt: record.createdAt?.toISOString() || null,
    })),
  };
}

export async function cancelRhCardMembership(id: string) {
  await requireAdmin("full");
  if (typeof id !== "string" || !CARD_ID_PATTERN.test(id)) {
    return { success: false, error: "Invalid RH Membership Card ID." };
  }
  const [card] = await db
    .select({ id: userCard.id, isActive: userCard.isActive })
    .from(userCard)
    .where(eq(userCard.id, id))
    .limit(1);
  if (!card) return { success: false, error: "RH Membership Card not found." };

  if (card.isActive) {
    await db
      .update(userCard)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(userCard.id, id), eq(userCard.isActive, true)));
  }

  revalidatePath("/admin/rh-card");
  revalidatePath(`/admin/rh-card/${id}`);
  revalidatePath("/dashboard", "layout");
  revalidatePath("/courses", "layout");
  return { success: true };
}
