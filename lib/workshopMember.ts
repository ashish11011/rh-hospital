import "server-only";
import { randomBytes, randomInt, randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/dbConfig";
import { user, userCard, workshop, workshopMemberVerification as verification } from "@/db";
import { isRhCardDiscountEligible } from "@/lib/rhCardDiscount";
import { sendWorkshopMemberOtpEmail } from "@/lib/sesClient";
import type { UserCard } from "@/lib/rhIdCard";
import {
  getOtpSendLimit, hashMemberSession, hashOtp, maskMemberEmail, matchesHash,
  MEMBER_SESSION_MS, normalizeMemberId, OTP_ATTEMPT_LIMIT, OTP_WINDOW_MS,
} from "@/lib/workshopMemberOtp";

export class WorkshopMemberError extends Error {
  constructor(message: string, public status = 400, public retryAfter = 0) {
    super(message);
  }
}

export function workshopMemberDetails(card: UserCard) {
  const designation = card.profession === "other"
    ? card.otherProfession || "Other"
    : card.profession.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return {
    name: card.fullName,
    email: card.email.trim().toLowerCase(),
    mobileNumber: card.mobileNumber,
    designation,
    instituteName: card.organizationName || "",
    city: card.city,
  };
}

async function eligibleCard(cardId: string, executor: Pick<typeof db, "select"> = db) {
  const [record] = await executor.select({ card: userCard, active: user.isActive })
    .from(userCard).innerJoin(user, eq(user.id, userCard.userId))
    .where(eq(userCard.id, cardId)).limit(1);
  return record?.active && isRhCardDiscountEligible(record.card) ? record.card : null;
}

export async function requestWorkshopMemberOtp(registrationId: string, workshopId: string) {
  const [event] = await db.select().from(workshop).where(eq(workshop.id, workshopId)).limit(1);
  if (!event || event.isCompleted) throw new WorkshopMemberError("This workshop is not open for registration.");
  const [candidate] = await db.select({ id: userCard.id }).from(userCard)
    .where(sql`upper(${userCard.memberShipId}) = ${normalizeMemberId(registrationId)}`).limit(1);
  if (!candidate) throw new WorkshopMemberError("An active paid RH Membership Card was not found for this registration ID.");

  const reserved = await db.transaction(async (tx) => {
    // Lock the card even on its first OTP request, when no verification row exists yet.
    await tx.select({ id: userCard.id }).from(userCard).where(eq(userCard.id, candidate.id)).for("update");
    const card = await eligibleCard(candidate.id, tx);
    if (!card) throw new WorkshopMemberError("This card is inactive, expired, or not eligible for the membership discount.");
    const [previous] = await tx.select().from(verification).where(eq(verification.cardId, card.id));
    const now = Date.now();
    const { recent, retryAfter } = getOtpSendLimit(previous?.sentAt || [], now);
    if (retryAfter) throw new WorkshopMemberError("You can request only 3 OTPs in 5 minutes. Please try again later.", 429, retryAfter);
    const challengeId = randomUUID();
    const code = String(randomInt(100000, 1000000));
    const values = {
      cardId: card.id, workshopId, challengeId, email: card.email.trim().toLowerCase(),
      codeHash: hashOtp(challengeId, code), expiresAt: new Date(now + OTP_WINDOW_MS),
      attempts: 0, sentAt: [...recent, now], sessionHash: null, sessionExpiresAt: null,
    };
    await tx.insert(verification).values(values).onConflictDoUpdate({ target: verification.cardId, set: values });
    return { card, code, challengeId };
  });

  try {
    await sendWorkshopMemberOtpEmail({ toEmail: reserved.card.email, otp: reserved.code });
  } catch {
    // A failed delivery still counts toward the limit, but can never be verified.
    await db.update(verification).set({ codeHash: null })
      .where(eq(verification.challengeId, reserved.challengeId));
    throw new WorkshopMemberError("Unable to send the OTP. Please try again later.", 503);
  }
  return { challengeId: reserved.challengeId, maskedEmail: maskMemberEmail(reserved.card.email), expiresIn: OTP_WINDOW_MS / 1000 };
}

export async function verifyWorkshopMemberOtp(challengeId: string, workshopId: string, code: string) {
  const result = await db.transaction(async (tx) => {
    const [challenge] = await tx.select().from(verification)
      .where(and(eq(verification.challengeId, challengeId), eq(verification.workshopId, workshopId))).limit(1).for("update");
    if (!challenge?.codeHash || challenge.expiresAt.getTime() <= Date.now())
      return { error: "This OTP has expired or has already been used. Request a new OTP." };
    if (challenge.attempts >= OTP_ATTEMPT_LIMIT)
      return { error: "Too many incorrect attempts. Request a new OTP." };
    // Return errors out of the transaction so failed-attempt increments are committed.
    if (!matchesHash(challenge.codeHash, hashOtp(challengeId, code))) {
      await tx.update(verification).set({ attempts: challenge.attempts + 1 })
        .where(eq(verification.cardId, challenge.cardId));
      return { error: "Incorrect OTP. Please try again." };
    }
    const card = await eligibleCard(challenge.cardId, tx);
    if (!card || card.email.trim().toLowerCase() !== challenge.email)
      return { error: "Your membership details have changed or the card is no longer eligible. Request a new OTP." };
    const token = randomBytes(32).toString("hex");
    await tx.update(verification).set({
      codeHash: null, sessionHash: hashMemberSession(token), sessionExpiresAt: new Date(Date.now() + MEMBER_SESSION_MS),
    }).where(eq(verification.cardId, card.id));
    return { card, cookie: `${card.id}.${token}` };
  });
  if (result.error || !result.card) throw new WorkshopMemberError(result.error || "Unable to verify OTP.", 401);
  return { cookie: result.cookie!, details: workshopMemberDetails(result.card) };
}

export async function getVerifiedWorkshopMember(cookie: string | undefined, workshopId: string) {
  if (!cookie || !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\.[\da-f]{64}$/.test(cookie))
    throw new WorkshopMemberError("Verify your RH Membership Card before registering.", 401);
  const [cardId, token] = cookie.split(".");
  const [session] = await db.select().from(verification).where(and(
    eq(verification.cardId, cardId), eq(verification.workshopId, workshopId),
  )).limit(1);
  if (!session?.sessionHash || !session.sessionExpiresAt || session.sessionExpiresAt.getTime() <= Date.now()
    || !matchesHash(session.sessionHash, hashMemberSession(token)))
    throw new WorkshopMemberError("Your membership verification has expired. Please verify again.", 401);
  const card = await eligibleCard(cardId);
  if (!card || card.email.trim().toLowerCase() !== session.email)
    throw new WorkshopMemberError("Your membership is no longer eligible. Please verify again.", 401);
  return card;
}
