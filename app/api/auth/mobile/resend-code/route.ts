import { logCognitoEmail } from "@/lib/emailLogging";
import { NextResponse } from "next/server";
import { CognitoIdentityProviderClient, ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { USER_POOL_CLIENT_ID, AWS_COGNITO_REGION, USER_POOL_CLIENT_SECRET } from "@/env";
import crypto from "crypto";

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_COGNITO_REGION,
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
       return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const secretHash = crypto
      .createHmac("sha256", USER_POOL_CLIENT_SECRET)
      .update(email + USER_POOL_CLIENT_ID)
      .digest("base64");

    const command = new ResendConfirmationCodeCommand({
      ClientId: USER_POOL_CLIENT_ID,
      Username: email,
      SecretHash: secretHash,
    });
    
    await logCognitoEmail(email, "verification code resend", () => cognitoClient.send(command));
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to resend verification code" }, { status: 400 });
  }
}
