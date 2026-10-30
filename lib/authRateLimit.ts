import "server-only";
import { headers } from "next/headers";
import {
  enforceAuthRateLimit,
  type AuthRateLimitAction,
} from "@/lib/rateLimit";

export async function enforceAuthActionRateLimit(
  action: AuthRateLimitAction,
  email: string,
) {
  await enforceAuthRateLimit(action, email, await headers());
}
