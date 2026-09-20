# iOS course purchases

The mobile app uses native StoreKit checkout on iOS. Android retains the website redirect. Products are non-consumables:

| Apple product ID / course slug | Older supported slug |
| --- | --- |
| nrpfornurses | nrp-for-nurses |
| palsfornurses | pals-for-nurses |
| triageemergenciesfornurses | triage-emergencies-for-nurses |

The app displays Apple's localized storefront price, binds purchases to the authenticated database user's UUID using `appAccountToken`, and only finishes transactions after backend verification and database commit. Restore is tied to the original RH Healthcare account; purchases cannot be transferred between accounts. Family Sharing is not enabled by this implementation.

## Backend setup

1. Apply `db/migrations/0001_apple_course_purchases.sql` through the project's normal migration process (`npx drizzle-kit migrate` with the deployment database configured). No live migration was applied during implementation.
2. In App Store Connect, Users and Access → Integrations → In-App Purchase, create a server API key. Configure **server-only** environment variables:

```dotenv
APPLE_APP_ID=6803631027
APPLE_IAP_KEY_ID=your_key_id
APPLE_IAP_ISSUER_ID=your_issuer_id
APPLE_IAP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
# Required for Sandbox, TestFlight and App Review purchases alongside production.
APPLE_IAP_ALLOW_SANDBOX=true
```

Bundle ID is `com.rh.healthcare`. Never put the private key in the mobile app or an `EXPO_PUBLIC_` variable. Configuration is checked before checkout. Production is queried first; sandbox is attempted only for Apple's transaction-not-found response and when explicitly enabled.

3. Deploy the backend before publishing the mobile update.
4. Configure App Store Server Notifications **V2**, production and sandbox URLs, to `https://www.rhhealthcaresimulation.com/api/apple/notifications`. Signed refund/revocation and refund-reversal notifications update the Apple payment and course access. Notifications received before activation are safe: later activation queries Apple's current transaction status.

Verification uses Apple's official server library, an embedded Apple Root CA G3 public certificate, online certificate checks, bundle/environment verification, product allowlisting and account-token checks. No client-supplied price/status/owner is trusted. A unique database index and transactional locks make retries/restores idempotent. Existing website checkout records are unchanged; a new Apple purchase creates an active enrolment separate from any pending website enrolment.

The existing payment amount columns store whole currency units. Apple's precise price is stored in `apple_price_milliunits` and is used by the mobile purchase history response; `response_object` also retains the verified transaction. Existing aggregate reports that sum `amount` still use rounded whole units.

## iOS validation before release

The installed app must contain `NitroIap` and `NitroModules` (already present in the repository's iOS Podfile.lock). If the installed binary predates those native modules, create a new iOS build; OTA cannot add native modules. No purchases were made during development.

Use a development build or TestFlight with an Apple sandbox tester. The products in the screenshot are Ready for Review, so test availability in Sandbox and submit them through App Store Connect for production release. Verify:

- Each of the three courses shows the correct Apple storefront price and checkout sheet.
- Completing a purchase opens My Courses and creates one payment/enrolment.
- Cancelling returns to the course without granting access.
- A deferred/Ask to Buy purchase remains locked until Apple reports completion.
- Closing the app after paying, or losing network before verification, recovers through Restore purchases without a second charge.
- Repeated restores do not duplicate records. Another RH Healthcare account cannot claim the same transaction.
- Refunding/revoking a test purchase updates access through the V2 notification endpoint.
- Android still opens the existing website URL and shows its external-link icon.

Run backend regression checks with `node --test tests/apple-purchases.test.cjs`; run `npx tsc --noEmit --incremental false` in the backend and `npx tsc --noEmit` in the mobile project.

References: [Apple App Store Server Library](https://github.com/apple/app-store-server-library-node), [React Native IAP setup](https://www.openiap.dev/docs/setup/react-native).

## Missing NitroModules at startup

`npm run ios` starts Metro and opens the existing installed app; it does not compile native changes. After installing dependencies, run `cd ios && pod install && cd ..`, then `npm run ios:build` for a simulator or `npm run ios:build -- --device` for a connected iPhone. Expo Go cannot load this app's custom StoreKit/Nitro modules; use the development build. TestFlight requires a new native build uploaded through the normal release process.

The iOS provider checks for NitroModules before importing IAP. Older installed binaries keep opening the app and show purchase-unavailable guidance instead of crashing the root layout. This fallback does not enable purchases without the native module. Native changes also require a new compatible OTA runtime/app version before release; do not rely on JavaScript updates to add native dependencies.

Startup fallback checks: `node --test tests/apple-purchase-provider.test.cjs` in the mobile project.
