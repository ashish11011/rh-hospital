import "server-only";
import { RATE_LIMITS } from "@/lib/constants";
import { enforceRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getRedis, RedisUnavailableError } from "@/lib/redis";

export async function enforceWorkshopMemberSendLimit(cardId: string) {
  await enforceRateLimit(
    "workshop-member-send",
    cardId,
    RATE_LIMITS.workshopMember.send,
  );
}

export async function getWorkshopOtpAttempts(
  challengeId: string,
): Promise<number> {
  try {
    const redis = await getRedis();
    const raw = await redis.get(
      rateLimitKey("workshop-member-incorrect", challengeId),
    );
    const attempts = raw === null ? NaN : Number(raw);
    if (!Number.isSafeInteger(attempts) || attempts < 0) throw new Error();
    return attempts;
  } catch {
    throw new RedisUnavailableError();
  }
}

export async function initializeWorkshopOtpAttempts(
  challengeId: string,
  validityMs: number,
) {
  try {
    const redis = await getRedis();
    await redis.set(
      rateLimitKey("workshop-member-incorrect", challengeId),
      "0",
      "PX",
      validityMs,
    );
  } catch {
    throw new RedisUnavailableError();
  }
}

// Called while holding the PostgreSQL challenge lock. Preserve expiry across increments.
export const OTP_FAILURE_SCRIPT = `
if redis.call('EXISTS', KEYS[1]) == 0 then return -1 end
return redis.call('INCR', KEYS[1])
`;

export async function recordWorkshopOtpFailure(
  challengeId: string,
  remainingMs: number,
) {
  try {
    const redis = await getRedis();
    if (remainingMs <= 0) throw new Error();
    const count = Number(
      await redis.eval(
        OTP_FAILURE_SCRIPT,
        1,
        rateLimitKey("workshop-member-incorrect", challengeId),
      ),
    );
    if (count < 0) throw new Error();
  } catch {
    throw new RedisUnavailableError();
  }
}
