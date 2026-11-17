import { runLoggedOperation } from "@/lib/logging/operations";
import { createLogger } from "@/lib/logging/logger";
import "server-only";
import {
  APIError,
  APIException,
  AppStoreServerAPIClient,
  Environment,
  SignedDataVerifier,
} from "@apple/app-store-server-library";
import { appleRootCertificates } from "./rootCertificate";

const transactionSource = "lib/apple/verification.ts:verifyAppleTransaction";
const logger = createLogger("integration", transactionSource);

export class ApplePurchaseError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function appleConfiguration() {
  const key = process.env.APPLE_IAP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const keyId = process.env.APPLE_IAP_KEY_ID;
  const issuerId = process.env.APPLE_IAP_ISSUER_ID;
  const appAppleId = Number(process.env.APPLE_APP_ID || "6803631027");
  if (
    !key ||
    !keyId ||
    !issuerId ||
    !Number.isSafeInteger(appAppleId) ||
    appAppleId <= 0
  ) {
    throw new ApplePurchaseError(
      "App Store purchases are not available yet. Please try again later.",
      503,
    );
  }
  return {
    key,
    keyId,
    issuerId,
    appAppleId,
    bundleId: process.env.APPLE_BUNDLE_ID || "com.rhhealthcare.app",
  };
}

export async function verifyAppleTransaction(transactionId: string) {
  return runLoggedOperation(
    "integration",
    transactionSource,
    async () => {
      const config = appleConfiguration();
      const allowSandbox = process.env.APPLE_IAP_ALLOW_SANDBOX === "true";
      const environments = allowSandbox
        ? [Environment.PRODUCTION, Environment.SANDBOX]
        : [Environment.PRODUCTION];
      let productionUnauthorized = false;
      for (const environment of environments) {
        const client = new AppStoreServerAPIClient(
          config.key,
          config.keyId,
          config.issuerId,
          config.bundleId,
          environment,
        );
        let signedTransaction: string | undefined;
        try {
          signedTransaction = (await client.getTransactionInfo(transactionId))
            .signedTransactionInfo;
        } catch (error) {
          const appleError = error instanceof APIException ? error : undefined;
          const metadata = {
            environment,
            appleHttpStatus: appleError?.httpStatusCode,
            appleErrorCode: appleError?.apiError,
          };
          // Before first release Apple can reject production API access with 401.
          // Sandbox still requires a valid Apple-signed transaction for this app.
          if (
            allowSandbox &&
            environment === Environment.PRODUCTION &&
            appleError?.httpStatusCode === 401
          ) {
            productionUnauthorized = true;
            logger.warning(
              "Apple production lookup unauthorized; trying sandbox",
              metadata,
            );
            continue;
          }
          if (
            appleError?.apiError === APIError.TRANSACTION_ID_NOT_FOUND &&
            !productionUnauthorized
          ) {
            logger.diagnostic(
              "Apple transaction not found in environment",
              metadata,
            );
            continue;
          }
          logger.warning("Apple transaction lookup failed", metadata);
          throw new ApplePurchaseError(
            "Unable to verify with the App Store. Please restore your purchase shortly.",
            502,
          );
        }
        if (!signedTransaction) {
          logger.warning("Apple transaction lookup returned no signed transaction", {
            environment,
          });
          throw new ApplePurchaseError(
            "The App Store did not return a transaction.",
            502,
          );
        }
        const verifier = new SignedDataVerifier(
          appleRootCertificates,
          true,
          environment,
          config.bundleId,
          config.appAppleId,
        );
        try {
          const transaction =
            await verifier.verifyAndDecodeTransaction(signedTransaction);
          if (transaction.transactionId !== transactionId)
            throw new Error("Transaction mismatch");
          return transaction;
        } catch {
          logger.warning("Apple transaction failed signature or ID validation", {
            environment,
          });
          throw new ApplePurchaseError(
            "The App Store transaction could not be verified.",
            422,
          );
        }
      }
      throw new ApplePurchaseError("Purchase not found in the App Store.", 422);
    },
  );
}

export async function verifyAppleNotification(signedPayload: string) {
  return runLoggedOperation(
    "integration",
    "lib/apple/verification.ts:verifyAppleNotification",
    async () => {
      const config = appleConfiguration();
      const environments =
        process.env.APPLE_IAP_ALLOW_SANDBOX === "true"
          ? [Environment.PRODUCTION, Environment.SANDBOX]
          : [Environment.PRODUCTION];
      for (const environment of environments) {
        const verifier = new SignedDataVerifier(
          appleRootCertificates,
          true,
          environment,
          config.bundleId,
          config.appAppleId,
        );
        try {
          return await verifier.verifyAndDecodeNotification(signedPayload);
        } catch {
          /* Try the other explicitly enabled environment; both require Apple's signature. */
        }
      }
      throw new ApplePurchaseError("Invalid App Store notification.", 422);
    },
  );
}
