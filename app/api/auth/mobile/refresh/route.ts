import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  GetTokensFromRefreshTokenCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  AWS_COGNITO_REGION,
  USER_POOL_CLIENT_ID,
  USER_POOL_CLIENT_SECRET,
} from "@/env";

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_COGNITO_REGION,
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const refreshToken =
    typeof body?.refreshToken === "string" ? body.refreshToken.trim() : "";
  const deviceKey =
    typeof body?.deviceKey === "string" ? body.deviceKey.trim() : "";
  // Preserve the response field for older app versions, without using it to
  // authenticate: a login email isn't always the refresh secret-hash username.
  const username =
    typeof body?.username === "string" ? body.username.trim() : undefined;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "Refresh token is required" },
      { status: 400 },
    );
  }

  try {
    const response = await cognitoClient.send(
      new GetTokensFromRefreshTokenCommand({
        ClientId: USER_POOL_CLIENT_ID,
        ClientSecret: USER_POOL_CLIENT_SECRET || undefined,
        RefreshToken: refreshToken,
        ...(deviceKey && { DeviceKey: deviceKey }),
      }),
    );

    if (!response.AuthenticationResult?.IdToken) {
      return NextResponse.json(
        {
          error: "Session refresh is temporarily unavailable",
          code: "AUTH_REFRESH_UNAVAILABLE",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      tokens: response.AuthenticationResult,
      ...(username && { username }),
    });
  } catch (error: unknown) {
    const failure = error as { name?: string; message?: string };
    let message = failure.message || "Unknown Cognito refresh failure";
    for (const secret of [refreshToken, USER_POOL_CLIENT_SECRET]) {
      if (secret) message = message.split(secret).join("[redacted]");
    }
    console.error("Cognito refresh error", {
      name: failure.name,
      message: message.slice(0, 500),
    });

    const invalidSession = [
      "NotAuthorizedException",
      "RefreshTokenReuseException",
      "UserNotFoundException",
    ].includes(failure.name || "");
    return NextResponse.json(
      invalidSession
        ? {
            error: "Your session has expired. Please sign in again.",
            code: "SESSION_EXPIRED",
          }
        : {
            error:
              "Session refresh is temporarily unavailable. Please try again.",
            code: "AUTH_REFRESH_UNAVAILABLE",
          },
      { status: invalidSession ? 401 : 503 },
    );
  }
}
