"use server";

import { payment } from "@/db";
import { db } from "@/lib/dbConfig";
import { requireAdmin } from "@/lib/adminAuth";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

const PAGE_SIZE = 20;

export async function getAdminPayments({
  page = 1,
  search = "",
  status = "",
  orderType = "",
}: {
  page?: number;
  search?: string;
  status?: string;
  orderType?: string;
} = {}) {
  await requireAdmin("full");

  const term = typeof search === "string" ? search.trim().slice(0, 200) : "";
  const paymentStatus =
    typeof status === "string" ? status.trim().slice(0, 80) : "";
  const type = payment.orderType.enumValues.find(
    (value) => value === orderType,
  );
  const pattern = `%${term.replace(/[\\%_]/g, "\\$&")}%`;
  const condition = and(
    term
      ? or(
          ilike(payment.email, pattern),
          ilike(payment.contact, pattern),
          ilike(payment.gatewayOrderId, pattern),
          ilike(payment.getewayPaymentId, pattern),
          ilike(payment.transactionId, pattern),
          ilike(sql`${payment.id}::text`, pattern),
          ilike(sql`${payment.orderId}::text`, pattern),
        )
      : undefined,
    paymentStatus
      ? sql`lower(${payment.status}) = ${paymentStatus.toLowerCase()}`
      : undefined,
    type ? eq(payment.orderType, type) : undefined,
  );

  const [{ total }] = await db
    .select({ total: count() })
    .from(payment)
    .where(condition);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(
    pageCount,
    Number.isSafeInteger(page) && page > 0 ? page : 1,
  );
  const payments = await db
    .select({
      id: payment.id,
      orderType: payment.orderType,
      orderId: payment.orderId,
      gatewayOrderId: payment.gatewayOrderId,
      gatewayPaymentId: payment.getewayPaymentId,
      gatewayInvoiceId: payment.gatewayInvoiceId,
      modeOfPayment: payment.modeOfPayment,
      currency: payment.currency,
      amount: payment.amount,
      amountPaid: payment.amountPaid,
      amountDue: payment.amountDue,
      status: payment.status,
      email: payment.email,
      contact: payment.contact,
      transactionId: payment.transactionId,
      transactionDate: payment.transactionDate,
      createdAt: payment.createdAt,
    })
    .from(payment)
    .where(condition)
    .orderBy(sql`${payment.createdAt} desc nulls last`, desc(payment.id))
    .limit(PAGE_SIZE)
    .offset((currentPage - 1) * PAGE_SIZE);

  return {
    payments: payments.map((record) => ({
      ...record,
      createdAt: record.createdAt?.toISOString() || null,
      transactionDate: record.transactionDate?.toISOString() || null,
    })),
    total,
    page: currentPage,
    pageCount,
    limit: PAGE_SIZE,
  };
}
