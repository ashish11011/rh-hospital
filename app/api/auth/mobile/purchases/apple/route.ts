import { NextResponse } from "next/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { course, courseEnrolment, payment, user } from "@/db";
import { db } from "@/lib/dbConfig";
import { getAuthenticatedApiEmail } from "@/lib/mobileApiAuth";
import {
  appleProductForSlug,
  courseSlugsForAppleProduct,
} from "@/lib/apple/products";
import {
  appleConfiguration,
  ApplePurchaseError,
  verifyAppleTransaction,
} from "@/lib/apple/verification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getBuyer(request: Request) {
  const email = await getAuthenticatedApiEmail(request);
  if (!email)
    throw new ApplePurchaseError("Please sign in to purchase a course.", 401);
  const [buyer] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (!buyer)
    throw new ApplePurchaseError(
      "Complete your profile before purchasing.",
      404,
    );
  return buyer;
}

function errorResponse(error: unknown) {
  if (error instanceof ApplePurchaseError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
  console.error(
    "Apple purchase processing failed",
    error instanceof Error ? error.name : "Unknown error",
  );
  return NextResponse.json(
    {
      error: "Unable to activate your purchase. Please try Restore purchases.",
    },
    { status: 500 },
  );
}

// Prepare before showing Apple's payment sheet: configuration, course and buyer must be valid.
export async function GET(request: Request) {
  try {
    const buyer = await getBuyer(request);
    appleConfiguration();
    const courseId = new URL(request.url).searchParams.get("courseId");
    if (!courseId || !/^[0-9a-f-]{36}$/i.test(courseId))
      throw new ApplePurchaseError("Invalid course.");
    const [record] = await db
      .select()
      .from(course)
      .where(and(eq(course.id, courseId), eq(course.isActive, true)))
      .limit(1);
    const productId = record && appleProductForSlug(record.slug);
    if (!productId)
      throw new ApplePurchaseError(
        "This course is not available in the App Store.",
        404,
      );
    const [enrolled] = await db
      .select({ id: courseEnrolment.id })
      .from(courseEnrolment)
      .where(
        and(
          eq(courseEnrolment.courseId, record.id),
          eq(courseEnrolment.userId, buyer.id),
          eq(courseEnrolment.enrolmentStatus, "enrolled"),
        ),
      )
      .limit(1);
    if (enrolled)
      throw new ApplePurchaseError(
        "You already own this course. Open My Courses.",
        409,
      );
    return NextResponse.json(
      { productId, appAccountToken: buyer.id },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const buyer = await getBuyer(request);
    const body = await request.json().catch(() => null);
    if (
      !body ||
      typeof body.transactionId !== "string" ||
      !/^\d{1,64}$/.test(body.transactionId)
    ) {
      throw new ApplePurchaseError("Invalid App Store transaction.");
    }
    // Never accept product, price, status or owner claims from the mobile request.
    const transaction = await verifyAppleTransaction(body.transactionId);
    if (
      transaction.type !== "Non-Consumable" ||
      transaction.revocationDate != null ||
      transaction.inAppOwnershipType !== "PURCHASED"
    ) {
      throw new ApplePurchaseError(
        "This purchase is not eligible for course access.",
        422,
      );
    }
    if (transaction.appAccountToken?.toLowerCase() !== buyer.id.toLowerCase()) {
      throw new ApplePurchaseError(
        "This purchase belongs to a different RH Healthcare account. Sign in to the account used to buy it.",
        403,
      );
    }
    const slugs = courseSlugsForAppleProduct(transaction.productId || "");
    if (
      !slugs.length ||
      !transaction.originalTransactionId ||
      !transaction.environment
    ) {
      throw new ApplePurchaseError("Unknown course product.", 422);
    }
    const [record] = await db
      .select()
      .from(course)
      .where(inArray(course.slug, slugs))
      .limit(1);
    if (!record)
      throw new ApplePurchaseError(
        "The purchased course is unavailable. Please contact support.",
        404,
      );
    const orderId = `apple:${transaction.environment}:${transaction.originalTransactionId}`;
    const result = await db.transaction(async (tx) => {
      // Serialize restores/retries for this Apple purchase and this user's course.
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtextextended(${orderId}, 0))`,
      );
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtextextended(${`${buyer.id}:${record.id}`}, 0))`,
      );
      const [existing] = await tx
        .select()
        .from(payment)
        .where(eq(payment.gatewayOrderId, orderId))
        .limit(1);
      if (existing) {
        const [enrolment] = await tx
          .select()
          .from(courseEnrolment)
          .where(eq(courseEnrolment.id, existing.orderId))
          .limit(1);
        if (
          !enrolment ||
          enrolment.userId !== buyer.id ||
          enrolment.courseId !== record.id
        ) {
          throw new ApplePurchaseError(
            "This transaction has already been assigned to another account.",
            409,
          );
        }
        if (existing.status === "refunded")
          throw new ApplePurchaseError("This purchase has been refunded.", 422);
        await tx
          .update(courseEnrolment)
          .set({ enrolmentStatus: "enrolled", updatedAt: new Date() })
          .where(eq(courseEnrolment.id, enrolment.id));
        return { courseId: record.id, enrolmentId: enrolment.id };
      }
      const [active] = await tx
        .select()
        .from(courseEnrolment)
        .where(
          and(
            eq(courseEnrolment.userId, buyer.id),
            eq(courseEnrolment.courseId, record.id),
            eq(courseEnrolment.enrolmentStatus, "enrolled"),
          ),
        )
        .orderBy(desc(courseEnrolment.createdAt))
        .limit(1);
      // Keep Apple's entitlement separate from pending website payments, whose failure callbacks may expire their own enrolment.
      const enrolment =
        active ||
        (
          await tx
            .insert(courseEnrolment)
            .values({
              userId: buyer.id,
              courseId: record.id,
              enrolmentStatus: "enrolled",
            })
            .returning()
        )[0];
      // Existing payment columns store whole currency units; retain Apple's exact milliunit price in responseObject.
      const amount = Math.round((transaction.price || 0) / 1000);
      await tx.insert(payment).values({
        orderType: "course",
        orderId: enrolment.id,
        gatewayOrderId: orderId,
        appleOriginalTransactionId: transaction.originalTransactionId,
        appleEnvironment: transaction.environment,
        appleProductId: transaction.productId,
        appleAccountToken: transaction.appAccountToken,
        applePriceMilliunits: transaction.price,
        transactionId: transaction.transactionId,
        getewayPaymentId: transaction.transactionId,
        modeOfPayment: "Apple In-App Purchase",
        currency: transaction.currency || "INR",
        amount,
        amountPaid: amount,
        amountDue: 0,
        status: "completed",
        email: buyer.email,
        transactionDate: transaction.purchaseDate
          ? new Date(transaction.purchaseDate)
          : new Date(),
        description: `App Store: ${record.title}`,
        responseObject: transaction,
      });
      return { courseId: record.id, enrolmentId: enrolment.id };
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
