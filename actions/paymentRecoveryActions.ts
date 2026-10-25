"use server";

import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  courseEnrolment,
  payment,
  seminarRegistrations,
  workshopRegistration,
} from "@/db";
import { db } from "@/lib/dbConfig";
import { requireAdmin } from "@/lib/adminAuth";
import {
  getHdfcOrderStatus,
  normalizeHdfcOrderStatus,
} from "@/lib/hdfcGateway";
import { updatePaymentFromGatewayStatus } from "@/lib/paymentConfirmation";
import { createLogger } from "@/lib/logging/logger";
import { runLoggedOperation } from "@/lib/logging/operations";

const logger = createLogger("service", "actions/paymentRecoveryActions.ts");
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PaymentRecoveryDetails = {
  id: string;
  orderId: string;
  gatewayOrderId: string;
  orderType: string;
  email: string | null;
  contact: string | null;
  status: string;
  amount: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  gatewayStatus: string;
  gatewayAmount: number | null;
  gatewayCurrency: string | null;
  transactionId: string | null;
  paymentMethod: string | null;
  invoiceQueuedAt: string | null;
  verifiedAt: string;
  canRecover: boolean;
  blockedReason: string | null;
};

export type PaymentRecoveryResult = {
  success: boolean;
  message?: string;
  payment?: PaymentRecoveryDetails;
};

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNotes(value: string | null): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

async function loadRecovery(reference: string) {
  const term = typeof reference === "string" ? reference.trim() : "";
  if (!term || term.length > 200)
    throw new Error("Enter a valid HDFC order ID or payment ID.");
  const [record] = await db
    .select()
    .from(payment)
    .where(
      or(
        eq(payment.gatewayOrderId, term),
        uuidPattern.test(term) ? eq(payment.id, term) : undefined,
      ),
    )
    .limit(1);
  if (!record)
    throw new Error(
      "Payment record not found. Use the HDFC order ID or internal payment ID from Payments.",
    );
  if (record.appleOriginalTransactionId)
    throw new Error(
      "This payment was made through Apple and cannot be recovered through HDFC.",
    );

  const gateway = await getHdfcOrderStatus(record.gatewayOrderId).catch(
    (error) => {
      logger.error("HDFC recovery lookup failed", {
        error,
        paymentId: record.id,
      });
      throw new Error(
        "Unable to fetch payment details from HDFC. Please try again.",
      );
    },
  );
  const txnDetail = gateway.txn_detail as Record<string, unknown> | undefined;
  const amountValue =
    gateway.effective_amount ??
    gateway.amount ??
    txnDetail?.txn_amount ??
    txnDetail?.net_amount;
  const amount =
    typeof amountValue === "number" ||
    (typeof amountValue === "string" && amountValue.trim())
      ? Number(amountValue)
      : NaN;
  const gatewayAmount = Number.isFinite(amount) ? amount : null;
  const gatewayCurrency =
    textValue(gateway.currency) || textValue(txnDetail?.currency);
  const transactionId =
    textValue(gateway.txn_id) ||
    textValue(gateway.txnId) ||
    textValue(txnDetail?.txn_id) ||
    textValue(txnDetail?.txnId);
  const paymentMethod =
    textValue(gateway.payment_method_type) || textValue(gateway.payment_method);
  const reportedOrderId =
    textValue(gateway.order_id) || textValue(gateway.orderId);
  const hasRefund =
    gateway.refunded === true ||
    Number(gateway.amount_refunded ?? 0) > 0 ||
    (Array.isArray(gateway.refunds) &&
      gateway.refunds.some((refund: { status?: string }) =>
        ["SUCCESS", "PENDING", "MANUAL_REVIEW"].includes(refund.status || ""),
      ));
  let blockedReason =
    ["refunded", "refund_failed"].includes(record.status) || hasRefund
      ? "This payment has a refund or a refund in progress. Review it separately."
      : reportedOrderId !== record.gatewayOrderId
        ? "HDFC did not return the matching order ID."
        : normalizeHdfcOrderStatus(gateway.status) !== "completed"
          ? "HDFC has not confirmed this payment as completed."
          : gatewayAmount === null ||
              gatewayAmount !== record.amount ||
              record.amount <= 0
            ? "The amount returned by HDFC does not match the stored payment amount."
            : gatewayCurrency !== record.currency || record.currency !== "INR"
              ? "The currency returned by HDFC does not match the INR payment."
              : !transactionId
                ? "HDFC did not return a payment transaction ID."
                : null;

  // Validate the linked record before invoking the unchanged webhook fulfillment service.
  if (!blockedReason && record.orderType !== "product") {
    const table =
      record.orderType === "workshop"
        ? workshopRegistration
        : record.orderType === "course"
          ? courseEnrolment
          : seminarRegistrations;
    const [purchase] = await db
      .select({ id: table.id })
      .from(table)
      .where(eq(table.id, record.orderId))
      .limit(1);
    if (!purchase)
      blockedReason =
        "The linked purchase or registration is missing. Review it before completing payment.";
  }

  const details: PaymentRecoveryDetails = {
    id: record.id,
    orderId: record.orderId,
    gatewayOrderId: record.gatewayOrderId,
    orderType: record.orderType,
    email: record.email,
    contact: record.contact,
    status: record.status,
    amount: record.amount,
    amountPaid: record.amountPaid,
    amountDue: record.amountDue,
    currency: record.currency,
    gatewayStatus: gateway.status || "UNKNOWN",
    gatewayAmount,
    gatewayCurrency,
    transactionId,
    paymentMethod,
    invoiceQueuedAt: textValue(readNotes(record.notes).invoiceQueuedAt),
    verifiedAt: new Date().toISOString(),
    canRecover: blockedReason === null,
    blockedReason,
  };
  return { record, gateway, details };
}

export async function inspectAdminPayment(
  reference: string,
): Promise<PaymentRecoveryResult> {
  return runLoggedOperation(
    "service",
    "actions/paymentRecoveryActions.ts:inspectAdminPayment",
    async () => {
      await requireAdmin("full");
      try {
        const { details } = await loadRecovery(reference);
        return { success: true, payment: details };
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Unable to check this payment.",
        };
      }
    },
  );
}

export async function recoverAdminPayment(
  reference: string,
): Promise<PaymentRecoveryResult> {
  return runLoggedOperation(
    "service",
    "actions/paymentRecoveryActions.ts:recoverAdminPayment",
    async () => {
      const admin = await requireAdmin("full");
      let loaded: Awaited<ReturnType<typeof loadRecovery>>;
      try {
        // Always verify again on the server; never trust the browser's preview.
        loaded = await loadRecovery(reference);
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Unable to verify this payment.",
        };
      }
      const { record, gateway, details } = loaded;
      if (!details.canRecover)
        return {
          success: false,
          message: details.blockedReason!,
          payment: details,
        };

      try {
        const result = await updatePaymentFromGatewayStatus({
          gatewayOrderId: record.gatewayOrderId,
          gatewayStatus: gateway.status!,
          normalizedStatus: "completed",
          gatewayPaymentId: details.transactionId!,
          responseObject: gateway,
        });
        if (result.status !== "completed")
          throw new Error("Payment could not be completed.");
        const [saved] = await db
          .select()
          .from(payment)
          .where(eq(payment.id, record.id))
          .limit(1);
        const invoiceQueuedAt =
          saved && textValue(readNotes(saved.notes).invoiceQueuedAt);
        if (!saved || !invoiceQueuedAt)
          throw new Error("Invoice queue acknowledgement is missing.");
        revalidatePath("/admin/payments");
        revalidatePath("/admin/payment-recovery");
        logger.info("Admin payment recovery completed", {
          paymentId: record.id,
          adminEmail: admin.email,
          verifiedAt: details.verifiedAt,
        });
        return {
          success: true,
          message: "Payment completed, purchase fulfilled, and invoice queued.",
          payment: {
            ...details,
            status: saved.status,
            amountPaid: saved.amountPaid,
            amountDue: saved.amountDue,
            invoiceQueuedAt,
          },
        };
      } catch (error) {
        logger.error("Admin payment recovery incomplete", {
          error,
          paymentId: record.id,
        });
        return {
          success: false,
          message:
            "Recovery did not finish. Payment updates may already be saved. Check the payment again and retry to finish fulfillment and queue the invoice. An invoice already queued will not be queued again.",
        };
      }
    },
  );
}
