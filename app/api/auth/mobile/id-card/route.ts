import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { userSchema } from "@/db/userSchema";
import { db } from "@/lib/dbConfig";
import { getAuthenticatedApiEmail } from "@/lib/mobileApiAuth";
import {
  buildMemberShipId,
  getLatestUserCard,
  serializeCard,
  validateInput,
  type UserCardInput,
} from "@/lib/rhIdCard";
import {
  RH_ID_CARD_AMOUNT_INR,
  getRhCardPendingPurchase,
  startRhCardPurchase,
} from "@/lib/rhIdCardPayment";

export const dynamic = "force-dynamic";

async function getAuthenticatedUser(req: Request) {
  const email = await getAuthenticatedApiEmail(req);

  if (!email) return null;

  const [account] = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.email, email))
    .limit(1);

  return account || null;
}

export async function GET(req: Request) {
  try {
    const account = await getAuthenticatedUser(req);
    if (!account)
      return NextResponse.json(
        { error: "Unauthorized: Invalid token or session" },
        { status: 401 },
      );
    const card = await getLatestUserCard(account.id);
    const pendingPurchase = card
      ? null
      : await getRhCardPendingPurchase(account.id, account.email);
    return NextResponse.json({
      success: true,
      card: card
        ? serializeCard({
            ...card,
            memberShipId: card.memberShipId || buildMemberShipId(card),
          })
        : null,
      purchase: { amount: RH_ID_CARD_AMOUNT_INR, currency: "INR" },
      pendingPurchase,
      defaults: {
        fullName: account.name || "",
        mobileNumber: account.mobileNumber || "",
        email: account.email,
        city: account.city || "",
        organizationName: account.instituteName || "",
        ...pendingPurchase?.draft,
      },
    });
  } catch (error) {
    console.error("RH ID card load error", error);
    return NextResponse.json(
      { error: "Unable to load your RH ID card. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const account = await getAuthenticatedUser(req);
    if (!account)
      return NextResponse.json(
        { error: "Unauthorized: Invalid token or session" },
        { status: 401 },
      );
    const existing = await getLatestUserCard(account.id);
    if (existing)
      return NextResponse.json({
        success: true,
        card: serializeCard({
          ...existing,
          memberShipId: existing.memberShipId || buildMemberShipId(existing),
        }),
        message: "Membership card already exists",
      });
    let input;
    try {
      input = validateInput((await req.json()) as UserCardInput);
      if (!input.passportPhoto?.startsWith(`membership-cards/${account.id}/`))
        throw new Error(
          "Please upload your passport photo before continuing to payment",
        );
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Check your card details",
        },
        { status: 400 },
      );
    }
    const result = await startRhCardPurchase(account, input);
    return NextResponse.json({
      success: true,
      card: result.card
        ? serializeCard({
            ...result.card,
            memberShipId:
              result.card.memberShipId || buildMemberShipId(result.card),
          })
        : null,
      paymentRequired: !result.card,
      data: result.purchase,
      message: result.card
        ? "Membership card already exists"
        : "Complete payment to create your RH ID card",
    });
  } catch (error) {
    console.error("RH ID card checkout error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start payment. Please try again.",
      },
      { status: 500 },
    );
  }
}
