import "server-only";
import {
  AppStoreServerAPIClient,
  Environment,
  SignedDataVerifier,
  APIException,
} from "@apple/app-store-server-library";
import { appleRootCertificates } from "./rootCertificate";

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
  return { key, keyId, issuerId, appAppleId, bundleId: "com.rh.healthcare" };
}

export async function verifyAppleTransaction(transactionId: string) {
  const config = appleConfiguration();
  const environments =
    process.env.APPLE_IAP_ALLOW_SANDBOX === "true"
      ? [Environment.PRODUCTION, Environment.SANDBOX]
      : [Environment.PRODUCTION];
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
      // Sandbox/TestFlight IDs are not found in production. Never retry auth failures as sandbox.
      if (error instanceof APIException && error.apiError === 4040010) continue;
      throw new ApplePurchaseError(
        "Unable to verify with the App Store. Please restore your purchase shortly.",
        502,
      );
    }
    if (!signedTransaction)
      throw new ApplePurchaseError(
        "The App Store did not return a transaction.",
        502,
      );
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
      throw new ApplePurchaseError(
        "The App Store transaction could not be verified.",
        422,
      );
    }
  }
  throw new ApplePurchaseError("Purchase not found in the App Store.", 422);
}

export async function verifyAppleNotification(signedPayload: string) {
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
}
