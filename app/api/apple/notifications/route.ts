import { NextResponse } from "next/server";
import { and, eq, ne, sql } from "drizzle-orm";
import { decodeJwt } from "jose";
import { courseEnrolment, payment } from "@/db";
import { db } from "@/lib/dbConfig";
import {
  ApplePurchaseError,
  verifyAppleNotification,
  verifyAppleTransaction,
} from "@/lib/apple/verification";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (
      typeof body?.signedPayload !== "string" ||
      body.signedPayload.length > 100_000
    ) {
      return NextResponse.json(
        { error: "Invalid notification" },
        { status: 400 },
      );
    }
    const notification = await verifyAppleNotification(body.signedPayload);
    if (
      !["REFUND", "REVOKE", "REFUND_REVERSED"].includes(
        notification.notificationType || "",
      )
    ) {
      return NextResponse.json({ received: true });
    }
    const signedTransaction = notification.data?.signedTransactionInfo;
    if (!signedTransaction) return NextResponse.json({ received: true });
    // The outer notification is verified. This ID is only a lookup hint; fetch and
    // verify the current transaction directly from Apple before changing access.
    const hint = decodeJwt(signedTransaction);
    if (
      typeof hint.transactionId !== "string" ||
      !/^\d{1,64}$/.test(hint.transactionId)
    ) {
      throw new ApplePurchaseError("Invalid transaction ID.", 422);
    }
    const transaction = await verifyAppleTransaction(hint.transactionId);
    const orderId = `apple:${transaction.environment}:${transaction.originalTransactionId}`;
    await db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtextextended(${orderId}, 0))`,
      );
      const [stored] = await tx
        .select()
        .from(payment)
        .where(eq(payment.gatewayOrderId, orderId))
        .limit(1);
      // A refund before activation is rejected by purchase verification when the app retries.
      if (!stored) return;
      if (
        stored.appleProductId !== transaction.productId ||
        stored.appleAccountToken?.toLowerCase() !==
          transaction.appAccountToken?.toLowerCase()
      ) {
        throw new ApplePurchaseError("Transaction ownership mismatch.", 422);
      }
      // Fetch under the lock so delayed notifications cannot override a newer Apple state.
      const current = await verifyAppleTransaction(
        hint.transactionId as string,
      );
      const revoked = current.revocationDate != null;
      await tx
        .update(payment)
        .set({
          status: revoked ? "refunded" : "completed",
          amountPaid: revoked ? 0 : stored.amount,
          responseObject: current,
        })
        .where(eq(payment.id, stored.id));
      const [enrolment] = await tx
        .select()
        .from(courseEnrolment)
        .where(eq(courseEnrolment.id, stored.orderId))
        .limit(1);
      if (!enrolment) return;
      const [otherPayment] = await tx
        .select({ id: payment.id })
        .from(payment)
        .where(
          and(
            eq(payment.orderId, enrolment.id),
            ne(payment.id, stored.id),
            eq(payment.status, "completed"),
          ),
        )
        .limit(1);
      if (!revoked || !otherPayment) {
        await tx
          .update(courseEnrolment)
          .set({
            enrolmentStatus: revoked ? "refunded" : "enrolled",
            updatedAt: new Date(),
          })
          .where(eq(courseEnrolment.id, enrolment.id));
      }
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to process App Store notification" },
      { status: error instanceof ApplePurchaseError ? error.status : 500 },
    );
  }
}
