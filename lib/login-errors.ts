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

export async function resolveCognitoLoginError(error: unknown, email: string) {
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
      if (!/incorrect username or password|incorrect password/i.test(message)) {
        // Configuration and token errors must not be described as a bad password.
        return getLoginError("LOGIN_UNAVAILABLE");
      }

      // Cognito can mask missing users as an incorrect username/password error.
      // Check the identity provider, since the local profile may be absent or stale.
      try {
        const account = await accountLookup.send(
          new AdminGetUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: email.trim(),
          }),
        );
        if (account.Enabled === false) return getLoginError("ACCOUNT_DISABLED");
        return getLoginError("INCORRECT_PASSWORD");
      } catch (lookupError) {
        const lookupName = getErrorDetails(lookupError).name;
        if (lookupName === "UserNotFoundException") {
          return getLoginError("USER_NOT_FOUND");
        }
        console.error("Login account lookup failed", lookupName);
        // Do not guess which credential is wrong when IAM or Cognito is unavailable.
        return getLoginError("INVALID_CREDENTIALS");
      }
    }
    default:
      return getLoginError("LOGIN_UNAVAILABLE");
  }
}
