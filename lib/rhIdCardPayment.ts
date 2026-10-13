import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { payment, user, userCard } from "@/db";
import { db } from "@/lib/dbConfig";
import { RH_ID_CARD_AMOUNT_INR } from "@/lib/constants";
import {
  createHdfcCustomerId,
  createHdfcGatewayOrderId,
  createHdfcPaymentSession,
  getHdfcOrderStatus,
  normalizeHdfcOrderStatus,
} from "@/lib/hdfcGateway";
import {
  addYears,
  buildMemberShipId,
  validateInput,
  type ValidatedUserCardInput,
} from "@/lib/rhIdCard";
import {
  sendPaymentEventEmail,
  sendRhIdCardCreatedEmail,
} from "@/lib/sesClient";
import { publicAssetUrl, isMembershipPhotoKey } from "@/lib/publicAsset";
import type { HdfcPaymentEventName } from "@/lib/paymentConfirmation";

// Rupees. This module must never be imported by a client component.
export { RH_ID_CARD_AMOUNT_INR } from "@/lib/constants";

type CardPaymentNotes = {
  kind: "rh_id_card";
  userId: string;
  details: Omit<ValidatedUserCardInput, "dateOfBirth"> & {
    dateOfBirth: string | null;
  };
  checkout: { paymentUrl: string; expiresAt: string };
  fulfilledCardId?: string;
  confirmationEmailSentAt?: string;
};
type PaymentRecord = typeof payment.$inferSelect;

export function readRhCardPaymentNotes(
  notes: string | null,
): CardPaymentNotes | null {
  if (!notes) return null;
  try {
    const value = JSON.parse(notes);
    if (
      value?.kind !== "rh_id_card" ||
      typeof value.userId !== "string" ||
      !value.details ||
      typeof value.checkout?.paymentUrl !== "string" ||
      typeof value.checkout?.expiresAt !== "string"
    )
      return null;
    return value as CardPaymentNotes;
  } catch {
    return null;
  }
}

export function isRhCardPayment(
  record: Pick<PaymentRecord, "orderType" | "notes">,
) {
  return (
    record.orderType === "product" &&
    readRhCardPaymentNotes(record.notes) !== null
  );
}

function checkoutIsValid(notes: CardPaymentNotes) {
  return new Date(notes.checkout.expiresAt).getTime() > Date.now();
}

function publicPurchase(record: PaymentRecord, notes: CardPaymentNotes) {
  return {
    orderId: record.gatewayOrderId,
    amount: record.amount,
    currency: record.currency,
    status: record.status,
    paymentUrl:
      checkoutIsValid(notes) && record.status === "pending"
        ? notes.checkout.paymentUrl
        : null,
    expiresAt: notes.checkout.expiresAt,
  };
}

export async function getRhCardPendingPurchase(userId: string, email: string) {
  const records = await db
    .select()
    .from(payment)
    .where(and(eq(payment.orderType, "product"), eq(payment.email, email)))
    .orderBy(desc(payment.createdAt))
    .limit(20);
  for (const record of records) {
    const notes = readRhCardPaymentNotes(record.notes);
    if (
      notes?.userId === userId &&
      ["pending", "completed"].includes(record.status)
    ) {
      return {
        ...publicPurchase(record, notes),
        draft: {
          ...notes.details,
          email,
          dateOfBirth: notes.details.dateOfBirth || "",
          bloodGroup: notes.details.bloodGroup || "",
          rhFactor: notes.details.rhFactor || "",
          otherProfession: notes.details.otherProfession || "",
          organizationName: notes.details.organizationName || "",
          passportPhoto: notes.details.passportPhoto || "",
          passportPhotoUrl: publicAssetUrl(notes.details.passportPhoto),
          referralCode: notes.details.referralCode || "",
          hearAboutRh: notes.details.hearAboutRh || "",
        },
      };
    }
  }
  return null;
}

export async function startRhCardPurchase(
  account: typeof user.$inferSelect,
  input: ValidatedUserCardInput,
) {
  return db.transaction(async (tx) => {
    // Serialize checkout creation for this account, including across website and mobile.
    const [lockedAccount] = await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, account.id))
      .for("update");
    if (!lockedAccount)
      throw new Error(
        "Your account is no longer available. Please sign in again.",
      );
    const [existingCard] = await tx
      .select()
      .from(userCard)
      .where(eq(userCard.userId, account.id))
      .orderBy(desc(userCard.createdAt))
      .limit(1);
    if (existingCard) return { card: existingCard, purchase: null };

    const records = await tx
      .select()
      .from(payment)
      .where(
        and(eq(payment.orderType, "product"), eq(payment.email, account.email)),
      )
      .orderBy(desc(payment.createdAt))
      .limit(20);
    for (const record of records) {
      const notes = readRhCardPaymentNotes(record.notes);
      if (notes?.userId !== account.id) continue;
      if (record.status === "completed")
        throw new Error(
          "Your payment is confirmed. Your card is being prepared; please refresh shortly.",
        );
      if (record.status !== "pending") continue;
      const gateway = await getHdfcOrderStatus(record.gatewayOrderId);
      const gatewayStatus = normalizeHdfcOrderStatus(gateway.status);
      if (gatewayStatus === "completed")
        throw new Error(
          "Your payment has been received. Please verify the existing payment instead of paying again.",
        );
      if (gatewayStatus === "pending" && checkoutIsValid(notes)) {
        // Reuse the order and update its details before payment, rather than charging twice.
        const updatedNotes: CardPaymentNotes = {
          ...notes,
          details: {
            ...input,
            dateOfBirth: input.dateOfBirth?.toISOString().slice(0, 10) || null,
          },
        };
        await tx
          .update(payment)
          .set({ notes: JSON.stringify(updatedNotes) })
          .where(eq(payment.id, record.id));
        return { card: null, purchase: publicPurchase(record, updatedNotes) };
      }
    }

    const gatewayOrderId = createHdfcGatewayOrderId("RHC");
    const session = await createHdfcPaymentSession({
      gatewayOrderId,
      amount: RH_ID_CARD_AMOUNT_INR,
      customerId: createHdfcCustomerId(account.id),
      customerEmail: account.email,
      customerPhone: input.mobileNumber,
      customerName: input.fullName,
      description: "RH Membership Card purchase",
      returnQuery: { order_id: gatewayOrderId, type: "rh_id_card" },
    });
    if (!session.payment_links?.web)
      throw new Error("Payment link was not generated. Please try again.");
    const rawExpiry = session.payment_links.expiry || session.order_expiry;
    const expiresAt =
      rawExpiry && !Number.isNaN(new Date(rawExpiry).getTime())
        ? new Date(rawExpiry).toISOString()
        : new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const notes: CardPaymentNotes = {
      kind: "rh_id_card",
      userId: account.id,
      details: {
        ...input,
        dateOfBirth: input.dateOfBirth?.toISOString().slice(0, 10) || null,
      },
      checkout: { paymentUrl: session.payment_links.web, expiresAt },
    };
    // "product" is already supported by the payment enum; no schema change is needed.
    const [record] = await tx
      .insert(payment)
      .values({
        orderType: "product",
        orderId: randomUUID(),
        gatewayOrderId,
        gatewayInvoiceId: session.id,
        amount: RH_ID_CARD_AMOUNT_INR,
        amountDue: RH_ID_CARD_AMOUNT_INR,
        currency: "INR",
        email: account.email,
        contact: input.mobileNumber,
        status: "pending",
        notes: JSON.stringify(notes),
        description: "RH Membership Card",
        responseObject: session,
      })
      .returning();
    return { card: null, purchase: publicPurchase(record, notes) };
  });
}

export async function confirmRhCardPayment(input: {
  gatewayOrderId: string;
  normalizedStatus: string;
  gatewayEventName?: HdfcPaymentEventName;
  gatewayPaymentId?: string;
  responseObject?: unknown;
}) {
  // Card creation never trusts a browser redirect or a webhook's status alone.
  const gateway =
    input.normalizedStatus === "completed"
      ? await getHdfcOrderStatus(input.gatewayOrderId)
      : null;
  if (gateway) {
    const reportedOrderId = gateway.order_id || gateway.orderId;
    if (reportedOrderId && reportedOrderId !== input.gatewayOrderId)
      throw new Error("Payment order mismatch");
    const txnDetail = gateway.txn_detail as Record<string, unknown> | undefined;
    const paidAmount = Number(
      gateway.effective_amount ??
        gateway.amount ??
        txnDetail?.txn_amount ??
        txnDetail?.net_amount,
    );
    if (
      normalizeHdfcOrderStatus(gateway.status) !== "completed" ||
      paidAmount !== RH_ID_CARD_AMOUNT_INR ||
      (gateway.currency && gateway.currency !== "INR")
    )
      throw new Error(
        "RH Membership Card payment has not been verified for the correct amount",
      );
  }

  const [initialRecord] = await db
    .select()
    .from(payment)
    .where(eq(payment.gatewayOrderId, input.gatewayOrderId))
    .limit(1);
  const initialNotes =
    initialRecord && readRhCardPaymentNotes(initialRecord.notes);
  if (!initialNotes) throw new Error("RH Membership Card payment not found");
  const outcome = await db.transaction(async (tx) => {
    // Use the same lock order as checkout to avoid deadlocks during concurrent requests.
    const [account] = await tx
      .select()
      .from(user)
      .where(eq(user.id, initialNotes.userId))
      .for("update");
    const [record] = await tx
      .select()
      .from(payment)
      .where(eq(payment.gatewayOrderId, input.gatewayOrderId))
      .for("update");
    const notes = record && readRhCardPaymentNotes(record.notes);
    if (!record || record.orderType !== "product" || !notes)
      throw new Error("RH Membership Card payment not found");
    if (record.amount !== RH_ID_CARD_AMOUNT_INR || record.currency !== "INR")
      throw new Error("RH Membership Card payment amount mismatch");
    if (
      !account ||
      record.email !== account.email ||
      notes.userId !== account.id
    )
      throw new Error("RH Membership Card payment account mismatch");
    // Delayed failures must not undo a completed purchase; refunded cards stay refunded.
    const terminal =
      record.status === "refunded" ||
      (record.status === "completed" &&
        ["pending", "failed", "cancelled"].includes(input.normalizedStatus));
    if (terminal)
      return {
        record,
        status: record.status,
        card: null,
        alreadyCompleted: true,
      };
    const status = input.normalizedStatus;
    let fulfilledCard: typeof userCard.$inferSelect | null = null;
    if (status === "completed") {
      const [existingCard] = await tx
        .select()
        .from(userCard)
        .where(eq(userCard.userId, account.id))
        .orderBy(desc(userCard.createdAt))
        .limit(1);
      fulfilledCard = existingCard || null;
      if (!fulfilledCard) {
        const details = validateInput(notes.details);
        if (
          !isMembershipPhotoKey(details.passportPhoto, account.id)
        )
          throw new Error("Invalid RH Membership Card passport photo");
        const activationDate = new Date();
        const [created] = await tx
          .insert(userCard)
          .values({
            ...details,
            id: record.orderId,
            userId: account.id,
            email: account.email,
            memberShipType: "temporary",
            activationDate,
            validityDate: addYears(activationDate, 1),
            cardType: "paid",
            membershipPurchaseType: "paid",
            isActive: true,
          })
          .returning();
        const [withMemberId] = await tx
          .update(userCard)
          .set({ memberShipId: buildMemberShipId(created) })
          .where(eq(userCard.id, created.id))
          .returning();
        fulfilledCard = withMemberId;
      }
      notes.fulfilledCardId = fulfilledCard.id;
    } else if (
      status === "refunded" &&
      record.status !== "refunded" &&
      notes.fulfilledCardId === record.orderId
    ) {
      await tx
        .update(userCard)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(userCard.id, notes.fulfilledCardId),
            eq(userCard.userId, account.id),
          ),
        );
    }
    await tx
      .update(payment)
      .set({
        status,
        amountPaid:
          status === "completed"
            ? record.amount
            : status === "refunded"
              ? 0
              : record.amountPaid,
        amountDue: ["completed", "refunded"].includes(status)
          ? 0
          : record.amountDue,
        getewayPaymentId: String(
          gateway?.txn_id ||
            gateway?.txnId ||
            input.gatewayPaymentId ||
            record.getewayPaymentId ||
            "",
        ),
        transactionId: String(
          gateway?.txn_id ||
            gateway?.txnId ||
            input.gatewayPaymentId ||
            record.transactionId ||
            "",
        ),
        responseObject: gateway || input.responseObject,
        notes: JSON.stringify(notes),
      })
      .where(eq(payment.id, record.id));
    return {
      record,
      status,
      card: fulfilledCard,
      alreadyCompleted: record.status === status,
    };
  });

  if (outcome.status === "completed" && outcome.card) {
    const confirmedCard = outcome.card;
    // Commit the card first. Serialize email delivery separately so retries can recover a send failure.
    await db.transaction(async (tx) => {
      const [record] = await tx
        .select()
        .from(payment)
        .where(eq(payment.id, outcome.record.id))
        .for("update");
      const notes = readRhCardPaymentNotes(record.notes);
      if (
        !notes ||
        notes.confirmationEmailSentAt ||
        record.status !== "completed"
      )
        return;
      await sendRhIdCardCreatedEmail({
        toEmail: confirmedCard.email,
        name: confirmedCard.fullName,
        memberShipId:
          confirmedCard.memberShipId || buildMemberShipId(confirmedCard),
        validityDate: confirmedCard.validityDate,
        orderId: record.gatewayOrderId,
        amount: record.amount,
      });
      await tx
        .update(payment)
        .set({
          notes: JSON.stringify({
            ...notes,
            confirmationEmailSentAt: new Date().toISOString(),
          }),
        })
        .where(eq(payment.id, record.id));
    });
  } else if (
    !outcome.alreadyCompleted &&
    outcome.record.email &&
    input.gatewayEventName
  ) {
    await sendPaymentEventEmail({
      toEmail: outcome.record.email,
      name: initialNotes.details.fullName,
      eventName: input.gatewayEventName,
      orderId: outcome.record.gatewayOrderId,
      amount: outcome.record.amount,
      currency: outcome.record.currency,
    });
  }
  return {
    status: outcome.status,
    orderType: "rh_id_card",
    gatewayOrderId: outcome.record.gatewayOrderId,
    amount: outcome.record.amount,
    currency: outcome.record.currency,
    alreadyCompleted: outcome.alreadyCompleted,
  };
}
