import { logCognitoEmail } from "@/lib/emailLogging";
import { NextResponse } from "next/server";
import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
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
    
    if (typeof data.email !== "string" || !data.email.trim() || !data.password || !data.name) {
       return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 });
    }

    const email = data.email.trim().toLowerCase();
    const secretHash = crypto
      .createHmac("sha256", USER_POOL_CLIENT_SECRET)
      .update(email + USER_POOL_CLIENT_ID)
      .digest("base64");

    const command = new SignUpCommand({
      ClientId: USER_POOL_CLIENT_ID,
      Username: email,
      Password: data.password,
      SecretHash: secretHash,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: data.name }
      ],
    });
    
    await logCognitoEmail(email, "signup verification", () => cognitoClient.send(command));
    const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1);
    
    if (!existingUser || existingUser.length === 0) {
      await db.insert(user).values({
        name: data.name,
        email,
        mobileNumber: data.phone || "",
        designation: "",
        instituteName: "",
        password: data.password,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.name === "UsernameExistsException") {
      return NextResponse.json({ error: "exists" }, { status: 409 });
    }
    if (error.name === "InvalidPasswordException") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to sign up" }, { status: 400 });
  }
}
