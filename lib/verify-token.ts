import { runLoggedOperation } from "@/lib/logging/operations";
import { createLogger } from "@/lib/logging/logger";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { USER_POOL_ID, USER_POOL_CLIENT_ID } from "@/env";

const logger = createLogger("integration", "lib/verify-token.ts");

// Verifier for Cognito ID tokens
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "id",
  clientId: USER_POOL_CLIENT_ID,
});

export async function extractEmailFromToken(
  token: string,
): Promise<string | null> {
  return runLoggedOperation(
    "integration",
    "lib/verify-token.ts:extractEmailFromToken",
    async () => {
      try {
        const payload = await verifier.verify(token);
        return (payload.email as string) || null;
      } catch (error) {
        logger.error("Token verification failed:", { details: [error] });
        return null;
      }
    },
  );
}
