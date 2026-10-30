# Mobile course catalogue and iOS purchases

The mobile tabs are Courses, RH Card, My Courses, Notifications, and Account.
Courses opens an internal details screen containing the curriculum, reviews,
platform price, preview actions, and purchase controls. My Courses remains the
third tab and contains active enrolments and progress.

## Course configuration in Next.js admin

Apply the generated `db/migrations/0009_course_ios_purchase.sql` through the normal
migration process before deploying the backend that reads the new columns.
Migration `0008_nasty_spyke.sql` must also be applied for lesson access types.
Neither migration was applied to a live database during this work.

Course create/edit forms and the admin course list expose:

- `ios_price`: a nullable decimal amount in the course's currency, up to two decimal places.
- `ios_product_id`: the exact, unique non-consumable product ID in App Store Connect.

Enter both fields to enable new iOS purchases, or leave both blank to disable
checkout. Existing courses need these fields populated before their Apple
purchases/restores can resolve through the new database mapping. Retain the
original App Store product IDs for courses that have already been sold; do not
replace them with different IDs. Product IDs are no longer inferred from slugs.
For the previously configured courses, retain `nrpfornurses`, `palsfornurses`, and
`triageemergenciesfornurses` where those are their actual App Store product IDs.
No iOS prices are guessed or copied from website prices by the migration.

The configured iOS price is shown on iOS catalogue cards and as a details fallback.
Once StoreKit loads the product, the detail/purchase button shows Apple's localized
storefront price. App Store Connect controls the charge; editing the admin price
**does not** update Apple's product pricing. Keep the two configured consistently.
Android opens the course's website page and uses website pricing. Returning from
the website refreshes purchases and the current course's access.

## Lesson previews

`GET /api/auth/mobile/course-catalog/[courseId]` accepts a course ID or slug and
returns public course metadata plus live, user-specific `canAccess` flags. It
requires an active account and never returns raw media keys or URLs.

Free lessons require login. Member lessons require an active RH membership or an
active course enrolment. Paid lessons require enrolment. Playback and document
routes recheck these same rules in PostgreSQL before issuing scoped CloudFront
grants, including on grant renewal. Mobile never receives an admin bypass. Preview
playback does not create an enrolment or learning-progress record. Only lessons
marked `paid` save playback progress, including inside enrolled courses. Free and
member lessons start fresh and are excluded from saved completion totals. The
progress endpoint also ignores writes for those lesson types. Existing records
are not deleted.

Public metadata uses the shared Redis catalogue cache; eligibility is never cached
in that shared data. Course edits invalidate the metadata cache.

## Native checkout and restore

The app uses `expo-iap` / StoreKit for non-consumable courses. The app-level purchase
provider listens for delayed transactions, supports Restore purchases, and retries
activation without finishing unverified purchases. Duplicate events are coalesced;
server transactions/advisory locks serialize payment and enrolment updates.
Changing RH accounts during verification cannot unlock or finish a purchase for
the new account. Restores require the original RH account.

Configure these **backend-only** variables:

```dotenv
APPLE_APP_ID=6803631027
APPLE_BUNDLE_ID=com.rhhealthcare.app
APPLE_IAP_KEY_ID=your_key_id
APPLE_IAP_ISSUER_ID=your_issuer_id
APPLE_IAP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
APPLE_IAP_ALLOW_SANDBOX=true
```

The bundle ID defaults to the actual iOS app identifier, `com.rhhealthcare.app`.
The backend verifies Apple's signed transaction, owner account token, environment,
product ID, revocation state, and purchase type. Client-supplied prices and status
are ignored. The payment stores Apple's verified currency and exact milliunit
price. Configure App Store Server Notifications V2 (production and sandbox) at:
`https://www.rhhealthcaresimulation.com/api/apple/notifications`.
Refunds/revocations update the existing payment and access records.

After a verified Apple payment and its enrolment commit to PostgreSQL, the backend
awaits the same invoice SQS helper used by HDFC. The message is `{ paymentId }`,
using the database payment UUID. `invoiceQueuedAt` is saved in payment notes only
after SQS acknowledges the message. Purchase retries/restores retry an unqueued
invoice without creating another payment; an acknowledged invoice is skipped.
If queueing fails, payment/access remain committed but the API returns an error
so the app keeps the Apple transaction retryable. Refund-reversal notifications
also retry missing queue submissions after committing completion; refunds never
queue an invoice. Payment verification/status and queue failures log the payment
ID; the shared helper logs the payment ID and SQS message ID on acknowledgement.
PDF generation and email delivery remain asynchronous in the invoice Lambda.
The existing worker supports INR invoices only, including Apple's stored exact
milliunit price; non-INR invoice support is not added by this integration.

Deploy the backend and configure each course before shipping the mobile build.
`expo-iap` is a new native dependency and is listed in `app.json` plugins. EAS builds
regenerate the native projects (native directories are excluded in `.easignore`).
Local native builds need regenerated/synchronized native projects and pods as
appropriate. A **new iOS development/TestFlight/store binary is required**; Expo Go
and an OTA update to an old binary cannot add the native module. The provider
catches missing-module errors so an older binary can still open other screens.
No store purchase, live refund, migration, OTA publication, or release was performed.

## Validation

Run `npx tsc --noEmit` and `node --test tests/*.test.cjs` in both projects. Mobile
purchase tests verify price routing, finish-after-verification, duplicate events,
account switching, and tab order. Backend tests cover preview authorization,
config validation, admin form persistence, database product mapping, ownership,
retries/restores, and refund handling.

Before release, use an Apple sandbox tester in a native development build or
TestFlight to verify product availability, localized prices, cancellation, deferred
approval, interrupted activation, restore on the same and different RH accounts,
and refunds. Verify Android website checkout and return-to-app refresh on a device.
