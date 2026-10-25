"use server";
import { instrumentAwsClient } from "@/lib/logging/aws";

import { runLoggedOperation } from "@/lib/logging/operations";

import { logCognitoEmail } from "@/lib/emailLogging";
import { signIn } from "@/auth";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  USER_POOL_CLIENT_ID,
  AWS_COGNITO_REGION,
  USER_POOL_CLIENT_SECRET,
} from "@/env";
import crypto from "crypto";
import { AuthError, CredentialsSignin } from "next-auth";
import { db } from "@/lib/dbConfig";
import { user } from "@/db";
import { eq } from "drizzle-orm";
import {
  getLoginError,
  resolveExistingCognitoSignup,
  type ExistingSignupResult,
} from "@/lib/login-errors";

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_COGNITO_REGION,
});
instrumentAwsClient(cognitoClient, "lib/actions/auth.ts");

export async function loginWithCredentials(data: any) {
  return runLoggedOperation(
    "integration",
    "lib/actions/auth.ts:loginWithCredentials",
    async () => {
      try {
        await signIn("credentials", {
          email: data.email.trim().toLowerCase(),
          password: data.password,
          redirect: false,
        });
        return { success: true };
      } catch (error) {
        if (error instanceof AuthError) {
          const code =
            error instanceof CredentialsSignin
              ? error.code
              : error.cause?.err?.message;
          const loginError = getLoginError(
            code === "credentials" ? "INVALID_CREDENTIALS" : code,
          );
          if (loginError.code === "EMAIL_NOT_VERIFIED") {
            return {
              error: "unconfirmed",
              email: data.email.trim().toLowerCase(),
            };
          }
          return { error: loginError.message };
        }
        throw error;
      }
    },
    true,
  );
}

export async function signupWithCognito(
  data: any,
): Promise<ExistingSignupResult | { success: true } | { error: string }> {
  return runLoggedOperation(
    "integration",
    "lib/actions/auth.ts:signupWithCognito",
    async () => {
      try {
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
            { Name: "name", Value: data.name },
            ...(data.phone
              ? [{ Name: "phone_number", Value: data.phone }]
              : []),
          ],
        });

        await logCognitoEmail(email, "signup verification", () =>
          cognitoClient.send(command),
        );

        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.email, email))
          .limit(1);

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

        return { success: true };
      } catch (error: any) {
        if (error.name === "UsernameExistsException") {
          return resolveExistingCognitoSignup(data.email);
        }
        return { error: error.message || "Failed to sign up" };
      }
    },
    true,
  );
}

export async function confirmWithCognito(data: {
  email: string;
  code: string;
}) {
  return runLoggedOperation(
    "integration",
    "lib/actions/auth.ts:confirmWithCognito",
    async () => {
      try {
        const email = data.email.trim().toLowerCase();
        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.email, email))
          .limit(1);
        if (!existingUser || existingUser.length === 0) {
          return { error: "User not found in database" };
        }

        const secretHash = crypto
          .createHmac("sha256", USER_POOL_CLIENT_SECRET)
          .update(email + USER_POOL_CLIENT_ID)
          .digest("base64");

        const command = new ConfirmSignUpCommand({
          ClientId: USER_POOL_CLIENT_ID,
          Username: email,
          ConfirmationCode: data.code,
          SecretHash: secretHash,
        });

        await cognitoClient.send(command);

        await db
          .update(user)
          .set({ isVarifiedEmail: true })
          .where(eq(user.email, email));

        return { success: true };
      } catch (error: any) {
        return { error: error.message || "Failed to verify email" };
      }
    },
    true,
  );
}

export async function forgotPasswordWithCognito(email: string) {
  return runLoggedOperation(
    "integration",
    "lib/actions/auth.ts:forgotPasswordWithCognito",
    async () => {
      try {
        email = email.trim().toLowerCase();
        const secretHash = crypto
          .createHmac("sha256", USER_POOL_CLIENT_SECRET)
          .update(email + USER_POOL_CLIENT_ID)
          .digest("base64");

        const command = new ForgotPasswordCommand({
          ClientId: USER_POOL_CLIENT_ID,
          Username: email,
          SecretHash: secretHash,
        });

        await logCognitoEmail(email, "password reset", () =>
          cognitoClient.send(command),
        );
        return { success: true };
      } catch (error: any) {
        return { error: error.message || "Failed to initiate password reset" };
      }
    },
    true,
  );
}

export async function resetPasswordWithCognito(data: any) {
  return runLoggedOperation(
    "integration",
    "lib/actions/auth.ts:resetPasswordWithCognito",
    async () => {
      try {
        const email = data.email.trim().toLowerCase();
        const secretHash = crypto
          .createHmac("sha256", USER_POOL_CLIENT_SECRET)
          .update(email + USER_POOL_CLIENT_ID)
          .digest("base64");

        const command = new ConfirmForgotPasswordCommand({
          ClientId: USER_POOL_CLIENT_ID,
          Username: email,
          ConfirmationCode: data.code,
          Password: data.password,
          SecretHash: secretHash,
        });

        await cognitoClient.send(command);
        return { success: true };
      } catch (error: any) {
        return { error: error.message || "Failed to reset password" };
      }
    },
    true,
  );
}

export async function resendVerificationCode(email: string) {
  return runLoggedOperation(
    "integration",
    "lib/actions/auth.ts:resendVerificationCode",
    async () => {
      try {
        email = email.trim().toLowerCase();
        const secretHash = crypto
          .createHmac("sha256", USER_POOL_CLIENT_SECRET)
          .update(email + USER_POOL_CLIENT_ID)
          .digest("base64");

        const command = new ResendConfirmationCodeCommand({
          ClientId: USER_POOL_CLIENT_ID,
          Username: email,
          SecretHash: secretHash,
        });

        await logCognitoEmail(email, "verification code resend", () =>
          cognitoClient.send(command),
        );
        return { success: true };
      } catch (error: any) {
        return { error: error.message || "Failed to resend verification code" };
      }
    },
    true,
  );
}
