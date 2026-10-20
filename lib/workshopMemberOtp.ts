import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const OTP_WINDOW_MS = 5 * 60 * 1000;
export const OTP_SEND_LIMIT = 3;
export const OTP_ATTEMPT_LIMIT = 5;
export const MEMBER_SESSION_MS = 15 * 60 * 1000;

export function normalizeMemberId(value: string) {
  return value.trim().toUpperCase();
}

export function getOtpSendLimit(sentAt: number[], now: number) {
  const recent = sentAt.filter((time) => time > now - OTP_WINDOW_MS);
  const retryAfter = recent.length >= OTP_SEND_LIMIT
    ? Math.max(1, Math.ceil((Math.min(...recent) + OTP_WINDOW_MS - now) / 1000))
    : 0;
  return { recent, retryAfter };
}

export function hashOtp(challengeId: string, otp: string) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for workshop member verification");
  return createHmac("sha256", secret).update(`workshop-member:${challengeId}:${otp}`).digest("hex");
}

export function hashMemberSession(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function matchesHash(left: string, right: string) {
  return left.length === right.length && timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

export function memberCookieName(workshopId: string) {
  return `rh_workshop_member_${workshopId}`;
}

export function maskMemberEmail(email: string) {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}
