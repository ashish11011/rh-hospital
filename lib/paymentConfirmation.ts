import "server-only";
import { course, courseEnrolment, payment, seminarRegistrations, user, workshopRegistration } from "@/db";
import { db } from "@/lib/dbConfig";
import { sendCoursePurchaseEmail, sendPaymentEventEmail, sendSeminarEmail, sendWorkshopEmail } from "@/lib/sesClient";
import { eq } from "drizzle-orm";

export type HdfcPaymentEventName =
  | "ORDER_FAILED"
  | "ORDER_SUCCEEDED"
  | "ORDER_REFUNDED"
  | "ORDER_REFUND_FAILED";

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

export function normalizeHdfcWebhookEvent(eventName?: string | null): PaymentWebhookStatus {
  if (eventName === "ORDER_SUCCEEDED") return "completed";
  if (eventName === "ORDER_FAILED") return "failed";
  if (eventName === "ORDER_REFUNDED") return "refunded";
  if (eventName === "ORDER_REFUND_FAILED") return "refund_failed";

  return "pending";
}

export async function updatePaymentFromGatewayStatus(input: ConfirmGatewayPaymentInput) {
  const [existingPayment] = await db
    .select()
    .from(payment)
    .where(eq(payment.gatewayOrderId, input.gatewayOrderId));

  if (!existingPayment) {
    throw new Error("Payment record not found");
  }

  const shouldComplete = input.normalizedStatus === "completed";
  const shouldFail = input.normalizedStatus === "failed" || input.normalizedStatus === "cancelled";
  const shouldRefund = input.normalizedStatus === "refunded";
  const statusChanged = existingPayment.status !== input.normalizedStatus;
  let eventRecipientName: string | null | undefined;

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
      getewayPaymentId: input.gatewayPaymentId || existingPayment.getewayPaymentId,
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

      if (existingPayment.email) {
        await sendWorkshopEmail({ toEmail: existingPayment.email });
      }
    } else if (existingPayment.orderType === "seminar") {
      await db
        .update(seminarRegistrations)
        .set({
          paymentStatus: "completed",
          paymentId: input.gatewayPaymentId || existingPayment.gatewayOrderId,
          orderId: existingPayment.gatewayOrderId,
        })
        .where(eq(seminarRegistrations.id, existingPayment.orderId));

      if (existingPayment.email) {
        await sendSeminarEmail({ toEmail: existingPayment.email });
      }
    } else if (existingPayment.orderType === "course") {
      const [coursePurchase] = await db
        .select({
          courseTitle: course.title,
          email: user.email,
          name: user.name,
        })
        .from(courseEnrolment)
        .innerJoin(course, eq(courseEnrolment.courseId, course.id))
        .innerJoin(user, eq(courseEnrolment.userId, user.id))
        .where(eq(courseEnrolment.id, existingPayment.orderId))
        .limit(1);

      eventRecipientName = coursePurchase?.name;

      await db
        .update(courseEnrolment)
        .set({ enrolmentStatus: "enrolled", updatedAt: new Date() })
        .where(eq(courseEnrolment.id, existingPayment.orderId));

      const toEmail = existingPayment.email || coursePurchase?.email;

      if (toEmail && coursePurchase) {
        await sendCoursePurchaseEmail({
          toEmail,
          name: coursePurchase.name,
          courseTitle: coursePurchase.courseTitle,
        });
      }
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
      const [coursePurchase] = await db
        .select({ name: user.name })
        .from(courseEnrolment)
        .innerJoin(user, eq(courseEnrolment.userId, user.id))
        .where(eq(courseEnrolment.id, existingPayment.orderId))
        .limit(1);

      eventRecipientName = coursePurchase?.name;

      await db
        .update(courseEnrolment)
        .set({ enrolmentStatus: "refunded", updatedAt: new Date() })
        .where(eq(courseEnrolment.id, existingPayment.orderId));
    }
  } else if (existingPayment.orderType === "course") {
    const [coursePurchase] = await db
      .select({ name: user.name })
      .from(courseEnrolment)
      .innerJoin(user, eq(courseEnrolment.userId, user.id))
      .where(eq(courseEnrolment.id, existingPayment.orderId))
      .limit(1);

    eventRecipientName = coursePurchase?.name;
  }

  if (statusChanged && existingPayment.email && input.gatewayEventName) {
    await sendPaymentEventEmail({
      toEmail: existingPayment.email,
      name: eventRecipientName,
      eventName: input.gatewayEventName,
      orderId: existingPayment.gatewayOrderId,
      amount: existingPayment.amount,
      currency: existingPayment.currency,
    });
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
