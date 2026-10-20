# Workshop registration with an RH Membership Card

Users can follow **Register for a workshop** from their website card panel, choose an upcoming workshop, and select **RH member · 20% off**. Regular registration remains available.

1. Enter the card's RH registration ID (case insensitive).
2. Request an OTP. SES emails the code to the address stored on the card; this is email verification, not SMS.
3. Enter the six-digit code to unlock the registration form with saved card details.
4. Choose an available attendance mode and pay 80% of that mode's listed price, rounded to whole rupees. Membership and coupon discounts cannot be combined.

The server requires an active user and an active, paid card with a current activation/validity period. It reloads the card at checkout and uses its owner, name, email, phone, profession, city and organization rather than client-supplied identity. If the card has no organization, the user can supply the institute name.

## Required database preparation

`db/workshopMemberSchema.ts`, exported by `db/index.ts`, defines the new `workshop_member_verification` table. **No migration was generated or applied.** Create this table through the normal migration process before enabling membership verification in a deployed environment. Existing workshop registrations need no new columns.

The table stores one row per card, rolling send timestamps, a keyed OTP hash, failed-attempt count, and a hashed verification session. Card-row locking serializes concurrent sends, including the first request. Limits persist across application instances/restarts and apply across workshops for the same card.

- Maximum 3 OTP send requests in any rolling 5-minute window, including resends and failed SES sends. A blocked request returns HTTP 429 and `Retry-After` seconds.
- Codes expire after 5 minutes, allow at most 5 incorrect attempts, and are consumed on successful verification. Resending replaces the previous code and verification session.
- A verified session lasts 15 minutes, is restricted to its workshop, and uses an HttpOnly, SameSite=Strict cookie scoped to `/api/workshop` (Secure in production). It grants workshop registration access, not a general account sign-in.
- Existing `AUTH_SECRET` (or `NEXTAUTH_SECRET`) must be configured, along with the existing SES credentials/sender configuration. Codes and raw session tokens are never persisted or returned in JSON.

Before verification, the API returns only a masked email address. Registered details are returned after successful verification. Membership cancellation, expiration, deactivation or email changes prevent further discounted checkout.

## Payments and invoices

The registration stores the listed `workshopAmount`, `couponDiscount: 0` and discounted `payableAmount`. The payment amount uses the same server-calculated price, and payment notes snapshot `memberDiscount`, `rhCardId`, `memberShipId` and `originalAmount`. The invoice worker includes the saved membership discount when reconciling totals. Deploy the accompanying `invoice-lambda/invoiceData.mjs` change with this feature.

Live SES delivery, HDFC payment and deployment must be verified separately after database preparation.
