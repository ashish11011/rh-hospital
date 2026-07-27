import { NextResponse } from "next/server";
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { USER_POOL_CLIENT_ID, AWS_COGNITO_REGION, USER_POOL_CLIENT_SECRET } from "@/env";
import crypto from "crypto";

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_COGNITO_REGION,
});

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const secretHash = crypto
      .createHmac("sha256", USER_POOL_CLIENT_SECRET)
      .update(email + USER_POOL_CLIENT_ID)
      .digest("base64");

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });

    const response = await cognitoClient.send(command);

    if (response.AuthenticationResult) {
      return NextResponse.json({ success: true, tokens: response.AuthenticationResult }, { status: 200 });
    }
    
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  } catch (error: any) {
    console.error("Cognito auth error", error.name);
    if (error.name === "UserNotConfirmedException") {
      return NextResponse.json({ error: "unconfirmed" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || "Authentication failed" }, { status: 400 });
  }
}
