import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { AWS_COGNITO_REGION, USER_POOL_CLIENT_ID, USER_POOL_CLIENT_SECRET } from "@/env";
import crypto from "crypto";

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_COGNITO_REGION,
});

function getSecretHash(username: string) {
  return crypto
    .createHmac("sha256", USER_POOL_CLIENT_SECRET)
    .update(username + USER_POOL_CLIENT_ID)
    .digest("base64");
}

export async function POST(req: Request) {
  try {
    const { refreshToken, username, email } = await req.json();

    const cleanRefreshToken = typeof refreshToken === "string" ? refreshToken.trim() : "";
    const cognitoUsername =
      typeof username === "string" && username.trim()
        ? username.trim()
        : typeof email === "string"
          ? email.trim()
          : "";

    if (!cleanRefreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 });
    }

    if (!cognitoUsername) {
      return NextResponse.json({ error: "Username is required to refresh session" }, { status: 400 });
    }

    const command = new InitiateAuthCommand({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: USER_POOL_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: cleanRefreshToken,
        SECRET_HASH: getSecretHash(cognitoUsername),
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult?.IdToken) {
      return NextResponse.json({ error: "Failed to refresh session" }, { status: 401 });
    }

    return NextResponse.json(
      { success: true, tokens: response.AuthenticationResult, username: cognitoUsername },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Cognito refresh error", error.name);
    return NextResponse.json(
      { error: error.message || "Failed to refresh session" },
      { status: 401 }
    );
  }
}
