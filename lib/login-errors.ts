import { instrumentAwsClient } from "@/lib/logging/aws";

import { runLoggedOperation } from "@/lib/logging/operations";
import { createLogger } from "@/lib/logging/logger";
import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  AWS_COGNITO_REGION,
  USER_POOL_ID,
} from "@/env";

const logger = createLogger("integration", "lib/login-errors.ts");

const accountLookup = new CognitoIdentityProviderClient({
  region: AWS_COGNITO_REGION,
  ...(AWS_ACCESS_KEY && AWS_SECRET_KEY
    ? {
        credentials: {
          accessKeyId: AWS_ACCESS_KEY,
          secretAccessKey: AWS_SECRET_KEY,
        },
      }
    : {}),
});
instrumentAwsClient(accountLookup, "lib/login-errors.ts");

const loginErrors = {
  USER_NOT_FOUND: {
    message: "User doesn't exist. Please create an account.",
    status: 401,
  },
  INCORRECT_PASSWORD: {
    message: "Incorrect password. Please try again.",
    status: 401,
  },
  EMAIL_NOT_VERIFIED: {
    message: "Please verify your email before signing in.",
    status: 403,
  },
  PASSWORD_RESET_REQUIRED: {
    message: "You need to reset your password. Please use Forgot password.",
    status: 403,
  },
  ACCOUNT_DISABLED: {
    message: "Your account is disabled. Please contact support.",
    status: 403,
  },
  TOO_MANY_ATTEMPTS: {
    message:
      "Too many login attempts. Please wait a few minutes and try again.",
    status: 429,
  },
  INVALID_CREDENTIALS: {
    message:
      "Unable to verify your email or password. Please check your details and try again.",
    status: 401,
  },
  LOGIN_UNAVAILABLE: {
    message: "Unable to sign in right now. Please try again later.",
    status: 503,
  },
} as const;

export function getLoginError(code?: string) {
  const safeCode =
    code && Object.hasOwn(loginErrors, code)
      ? (code as keyof typeof loginErrors)
      : "LOGIN_UNAVAILABLE";
  return { code: safeCode, ...loginErrors[safeCode] };
}

function getErrorDetails(error: unknown) {
  const details = error as { name?: string; message?: string } | null;
  return { name: details?.name || "", message: details?.message || "" };
}

export type ExistingSignupResult = {
  error: "exists";
  code: string;
  message: string;
  nextStep: "verify_email" | "sign_in" | "reset_password" | "choose" | "none";
  email: string;
};

export async function resolveExistingCognitoSignup(
  email: string,
): Promise<ExistingSignupResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const result = (
    code: string,
    message: string,
    nextStep: ExistingSignupResult["nextStep"],
  ): ExistingSignupResult => ({
    error: "exists",
    code,
    message,
    nextStep,
    email: normalizedEmail,
  });
  try {
    const account = await accountLookup.send(
      new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: normalizedEmail,
      }),
    );
    if (account.Enabled === false)
      return result(
        "ACCOUNT_DISABLED",
        getLoginError("ACCOUNT_DISABLED").message,
        "none",
      );
    if (account.UserStatus === "UNCONFIRMED")
      return result(
        "EMAIL_NOT_VERIFIED",
        "Your account is waiting for email verification. Verify your email to continue.",
        "verify_email",
      );
    if (account.UserStatus === "RESET_REQUIRED")
      return result(
        "PASSWORD_RESET_REQUIRED",
        getLoginError("PASSWORD_RESET_REQUIRED").message,
        "reset_password",
      );
    if (
      account.UserStatus === "CONFIRMED" ||
      account.UserStatus === "FORCE_CHANGE_PASSWORD"
    ) {
      return result(
        "ACCOUNT_EXISTS",
        "An account already exists for this email. Sign in or reset your password.",
        "sign_in",
      );
    }
  } catch (error) {
    logger.warning("Signup account status lookup unavailable", {
      details: [getErrorDetails(error).name],
    });
  }
  // Keep recovery reachable when IAM or Cognito cannot tell us the account state.
  return result(
    "ACCOUNT_EXISTS",
    "An account already exists for this email. Sign in, reset your password, or verify your email if signup is unfinished.",
    "choose",
  );
}

export async function resolveCognitoLoginError(error: unknown, email: string) {
  return runLoggedOperation(
    "integration",
    "lib/login-errors.ts:resolveCognitoLoginError",
    async () => {
      const { name, message } = getErrorDetails(error);

      switch (name) {
        case "UserNotFoundException":
          return getLoginError("USER_NOT_FOUND");
        case "UserNotConfirmedException":
          return getLoginError("EMAIL_NOT_VERIFIED");
        case "PasswordResetRequiredException":
          return getLoginError("PASSWORD_RESET_REQUIRED");
        case "TooManyRequestsException":
        case "LimitExceededException":
          return getLoginError("TOO_MANY_ATTEMPTS");
        case "NotAuthorizedException": {
          if (/password attempts exceeded|too many.*attempts/i.test(message)) {
            return getLoginError("TOO_MANY_ATTEMPTS");
          }
          if (/user is disabled/i.test(message)) {
            return getLoginError("ACCOUNT_DISABLED");
          }
          if (
            !/incorrect username or password|incorrect password/i.test(message)
          ) {
            // Configuration and token errors must not be described as a bad password.
            return getLoginError("LOGIN_UNAVAILABLE");
          }

          // Cognito can mask missing users as an incorrect username/password error.
          // Check the identity provider, since the local profile may be absent or stale.
          try {
            const account = await accountLookup.send(
              new AdminGetUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: email.trim().toLowerCase(),
              }),
            );
            if (account.Enabled === false)
              return getLoginError("ACCOUNT_DISABLED");
            return getLoginError("INCORRECT_PASSWORD");
          } catch (lookupError) {
            const lookupName = getErrorDetails(lookupError).name;
            if (lookupName === "UserNotFoundException") {
              return getLoginError("USER_NOT_FOUND");
            }
            logger.error("Login account lookup failed", {
              details: [lookupName],
            });
            // Do not guess which credential is wrong when IAM or Cognito is unavailable.
            return getLoginError("INVALID_CREDENTIALS");
          }
        }
        default:
          return getLoginError("LOGIN_UNAVAILABLE");
      }
    },
  );
}
