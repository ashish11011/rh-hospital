import { CognitoJwtVerifier } from "aws-jwt-verify";
import { USER_POOL_ID, USER_POOL_CLIENT_ID } from "@/env";

// Verifier for Cognito ID tokens
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "id",
  clientId: USER_POOL_CLIENT_ID,
});

export async function extractEmailFromToken(token: string): Promise<string | null> {
  try {
    const payload = await verifier.verify(token);
    return payload.email as string || null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
