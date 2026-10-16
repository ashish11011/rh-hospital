import "server-only";
import {
  courseEnrolment,
  payment,
  seminarRegistrations,
  workshopRegistration,
} from "@/db";
import { db } from "@/lib/dbConfig";
import { enqueuePaymentInvoice } from "@/lib/invoiceQueue";
import { eq } from "drizzle-orm";
import { confirmRhCardPayment, isRhCardPayment } from "@/lib/rhIdCardPayment";

export type HdfcPaymentEventName =
  "ORDER_FAILED" | "ORDER_SUCCEEDED" | "ORDER_REFUNDED" | "ORDER_REFUND_FAILED";

type PaymentWebhookStatus =
  | "completed"
  | "failed"
  | "cancelled"
  | "pending"
  | "refunded"
  | "refund_failed";

type ConfirmGatewayPaymentInput = {
  gatewayOrderId: string;
  gatewayEventName?: HdfcPaymentEventName;
  gatewayStatus: string;
  normalizedStatus: PaymentWebhookStatus;
  gatewayPaymentId?: string;
  responseObject?: unknown;
};

export function normalizeHdfcWebhookEvent(
  eventName?: string | null,
): PaymentWebhookStatus {
  if (eventName === "ORDER_SUCCEEDED") return "completed";
  if (eventName === "ORDER_FAILED") return "failed";
  if (eventName === "ORDER_REFUNDED") return "refunded";
  if (eventName === "ORDER_REFUND_FAILED") return "refund_failed";

  return "pending";
}

export async function updatePaymentFromGatewayStatus(
  input: ConfirmGatewayPaymentInput,
) {
  const [existingPayment] = await db
    .select()
    .from(payment)
    .where(eq(payment.gatewayOrderId, input.gatewayOrderId));

  if (!existingPayment) {
    throw new Error("Payment record not found");
  }

  if (isRhCardPayment(existingPayment)) {
    const confirmation = await confirmRhCardPayment(input);
    // Product payments are RH Membership Cards. Fulfill the card before queueing.
    if (confirmation.status === "completed") {
      await enqueuePaymentInvoice(existingPayment.id);
    }
    return confirmation;
  }

  const shouldComplete = input.normalizedStatus === "completed";
  const shouldFail =
    input.normalizedStatus === "failed" ||
    input.normalizedStatus === "cancelled";
  const shouldRefund = input.normalizedStatus === "refunded";
  const statusChanged = existingPayment.status !== input.normalizedStatus;

  await db
    .update(payment)
    .set({
      status: input.normalizedStatus,
      amountPaid: shouldComplete
        ? existingPayment.amount
        : shouldRefund
          ? 0
          : existingPayment.amountPaid,
      amountDue: shouldComplete || shouldRefund ? 0 : existingPayment.amountDue,
      getewayPaymentId:
        input.gatewayPaymentId || existingPayment.getewayPaymentId,
      transactionId: input.gatewayPaymentId || existingPayment.transactionId,
      responseObject: input.responseObject as any,
    })
    .where(eq(payment.id, existingPayment.id));

  if (shouldComplete) {
    if (existingPayment.orderType === "workshop") {
      await db
        .update(workshopRegistration)
        .set({ paymentStatus: "completed" })
        .where(eq(workshopRegistration.id, existingPayment.orderId));
    } else if (existingPayment.orderType === "seminar") {
      await db
        .update(seminarRegistrations)
        .set({
          paymentStatus: "completed",
          paymentId: input.gatewayPaymentId || existingPayment.gatewayOrderId,
          orderId: existingPayment.gatewayOrderId,
        })
        .where(eq(seminarRegistrations.id, existingPayment.orderId));
    } else if (existingPayment.orderType === "course") {
      await db
        .update(courseEnrolment)
        .set({ enrolmentStatus: "enrolled", updatedAt: new Date() })
        .where(eq(courseEnrolment.id, existingPayment.orderId));
    }
  } else if (shouldFail) {
    if (existingPayment.orderType === "workshop") {
      await db
        .update(workshopRegistration)
        .set({ paymentStatus: "failed" })
        .where(eq(workshopRegistration.id, existingPayment.orderId));
    } else if (existingPayment.orderType === "seminar") {
      await db
        .update(seminarRegistrations)
        .set({
          paymentStatus: "failed",
          paymentId: input.gatewayPaymentId || existingPayment.gatewayOrderId,
          orderId: existingPayment.gatewayOrderId,
        })
        .where(eq(seminarRegistrations.id, existingPayment.orderId));
    } else if (existingPayment.orderType === "course") {
      await db
        .update(courseEnrolment)
        .set({ enrolmentStatus: "expired", updatedAt: new Date() })
        .where(eq(courseEnrolment.id, existingPayment.orderId));
    }
  } else if (shouldRefund) {
    if (existingPayment.orderType === "workshop") {
      await db
        .update(workshopRegistration)
        .set({ paymentStatus: "refunded" })
        .where(eq(workshopRegistration.id, existingPayment.orderId));
    } else if (existingPayment.orderType === "seminar") {
      await db
        .update(seminarRegistrations)
        .set({
          paymentStatus: "refunded",
          paymentId: input.gatewayPaymentId || existingPayment.gatewayOrderId,
          orderId: existingPayment.gatewayOrderId,
        })
        .where(eq(seminarRegistrations.id, existingPayment.orderId));
    } else if (existingPayment.orderType === "course") {
      await db
        .update(courseEnrolment)
        .set({ enrolmentStatus: "refunded", updatedAt: new Date() })
        .where(eq(courseEnrolment.id, existingPayment.orderId));
    }
  }

  if (
    shouldComplete &&
    ["course", "workshop", "seminar"].includes(existingPayment.orderType)
  ) {
    await enqueuePaymentInvoice(existingPayment.id);
  }

  return {
    status: input.normalizedStatus,
    orderType: existingPayment.orderType,
    gatewayOrderId: existingPayment.gatewayOrderId,
    amount: existingPayment.amount,
    currency: existingPayment.currency,
    alreadyCompleted: !statusChanged,
  };
}
