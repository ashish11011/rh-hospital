import { NextResponse } from "next/server";
import { createRemoteJWKSet, errors, jwtVerify } from "jose";
import {
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/dbConfig";
import { user, workshopRegistration, seminarRegistrations } from "@/db";
import {
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  AWS_COGNITO_REGION,
  USER_POOL_ID,
  USER_POOL_CLIENT_ID,
} from "@/env";

export const runtime = "nodejs";

const issuer = `https://cognito-idp.${AWS_COGNITO_REGION}.amazonaws.com/${USER_POOL_ID}`;
const keys = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
const cognito = new CognitoIdentityProviderClient({
  region: AWS_COGNITO_REGION,
  // Admin APIs require IAM credentials; use the app's AWS identity instead of
  // accidentally resolving an unrelated developer profile on this machine.
  ...(AWS_ACCESS_KEY && AWS_SECRET_KEY
    ? {
        credentials: {
          accessKeyId: AWS_ACCESS_KEY,
          secretAccessKey: AWS_SECRET_KEY,
        },
      }
    : {}),
});

export async function DELETE(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer,
      audience: USER_POOL_CLIENT_ID,
      algorithms: ["RS256"],
      requiredClaims: ["exp", "sub", "email", "cognito:username"],
    });
    const username = payload["cognito:username"];
    if (
      payload.token_use !== "id" ||
      payload.email_verified !== true ||
      typeof payload.email !== "string" ||
      typeof username !== "string"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check the live identity so an old token cannot delete a newly registered account.
    try {
      const identity = await cognito.send(
        new AdminGetUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
        }),
      );
      if (
        !identity.Enabled ||
        identity.UserAttributes?.find((attribute) => attribute.Name === "sub")
          ?.Value !== payload.sub
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "UserNotFoundException") {
        return NextResponse.json({ success: true });
      }
      throw error;
    }

    const email = payload.email.toLowerCase();
    await db.transaction(async (tx) => {
      const [account] = await tx
        .select({ id: user.id })
        .from(user)
        .where(sql`lower(${user.email}) = ${email}`)
        .for("update");
      if (account) {
        // await tx
        //   .delete(workshopRegistration)
        //   .where(
        //     or(
        //       eq(workshopRegistration.userId, account.id),
        //       sql`lower(${workshopRegistration.email}) = ${email}`,
        //     ),
        //   );
        // await tx
        //   .delete(seminarRegistrations)
        //   .where(
        //     or(
        //       eq(seminarRegistrations.userId, account.id),
        //       sql`lower(${seminarRegistrations.email}) = ${email}`,
        //     ),
        //   );
        await tx.delete(user).where(eq(user.id, account.id));
      }
      // A Cognito failure rolls back the database deletions.
      await cognito.send(
        new AdminDeleteUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
        }),
      );
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof errors.JOSEError &&
      error.code !== "ERR_JWKS_TIMEOUT"
    ) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 },
      );
    }
    console.error("Account deletion failed", error);
    return NextResponse.json(
      { error: "Unable to delete your account. Please try again." },
      { status: 500 },
    );
  }
}
