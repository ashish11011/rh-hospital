import { NextResponse } from "next/server";
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { USER_POOL_CLIENT_ID, AWS_COGNITO_REGION, USER_POOL_CLIENT_SECRET } from "@/env";
import crypto from "crypto";
import { db } from "@/lib/dbConfig";
import { user } from "@/db";
import { eq } from "drizzle-orm";

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_COGNITO_REGION,
});

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.email || !data.code) {
       return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const existingUser = await db.select().from(user).where(eq(user.email, data.email)).limit(1);
    if (!existingUser || existingUser.length === 0) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    const secretHash = crypto
      .createHmac("sha256", USER_POOL_CLIENT_SECRET)
      .update(data.email + USER_POOL_CLIENT_ID)
      .digest("base64");

    const command = new ConfirmSignUpCommand({
      ClientId: USER_POOL_CLIENT_ID,
      Username: data.email,
      ConfirmationCode: data.code,
      SecretHash: secretHash,
    });
    
    await cognitoClient.send(command);

    await db.update(user).set({ isVarifiedEmail: true }).where(eq(user.email, data.email));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify email" }, { status: 400 });
  }
}
