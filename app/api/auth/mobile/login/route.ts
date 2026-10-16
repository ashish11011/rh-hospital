import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  USER_POOL_CLIENT_ID,
  AWS_COGNITO_REGION,
  USER_POOL_CLIENT_SECRET,
} from "@/env";
import crypto from "crypto";
import { db } from "@/lib/dbConfig";
import { user } from "@/db";
import { eq } from "drizzle-orm";

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_COGNITO_REGION,
});

export async function POST(req: Request) {
  try {
    const { email, password, fcmToken, deviceId } = await req.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const cognitoUsername = email.trim();
    const normalizedEmail = cognitoUsername.toLowerCase();

    const secretHash = crypto
      .createHmac("sha256", USER_POOL_CLIENT_SECRET)
      .update(cognitoUsername + USER_POOL_CLIENT_ID)
      .digest("base64");

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: cognitoUsername,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });

    const response = await cognitoClient.send(command);

    if (response.AuthenticationResult) {
      const [existingUser] = await db
        .select({ deviceId: user.deviceId })
        .from(user)
        .where(eq(user.email, normalizedEmail))
        .limit(1);

      if (existingUser) {
        const loginUpdate: {
          fcmToken?: string | null;
          deviceId?: string;
          lastActive: Date;
        } = {
          lastActive: new Date(),
        };

        const cleanFcmToken =
          typeof fcmToken === "string" ? fcmToken.trim() : "";
        const cleanDeviceId =
          typeof deviceId === "string" ? deviceId.trim() : "";

        if (cleanFcmToken) {
          loginUpdate.fcmToken = cleanFcmToken;
        } else if (cleanDeviceId) {
          // The app registers asynchronously after login/permission approval.
          // Do not keep sending to an older device while that happens.
          loginUpdate.fcmToken = null;
        }

        if (cleanDeviceId && existingUser.deviceId !== cleanDeviceId) {
          loginUpdate.deviceId = cleanDeviceId;
        }

        await db
          .update(user)
          .set(loginUpdate)
          .where(eq(user.email, normalizedEmail));
      }

      return NextResponse.json(
        {
          success: true,
          tokens: response.AuthenticationResult,
          username: cognitoUsername,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 },
    );
  } catch (error: any) {
    console.error("Cognito auth error", error.name);
    if (error.name === "UserNotConfirmedException") {
      return NextResponse.json({ error: "unconfirmed" }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 400 },
    );
  }
}
