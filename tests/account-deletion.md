Account deletion deployment and verification

- Deploy `DELETE /api/auth/mobile/account` to the host configured in the mobile app's `API_BASE_URL`.
- Configure `AWS_COGNITO_REGION`, `USER_POOL_ID`, `USER_POOL_CLIENT_ID`, and `DATABASE_URL`. The AWS SDK credential chain must resolve credentials with `cognito-idp:AdminGetUser` and `cognito-idp:AdminDeleteUser` for this pool.
- The endpoint accepts the mobile app's Cognito ID token in the Bearer authorization header. It verifies the signature, issuer, audience, expiry, token use, verified email, and current Cognito subject. It never accepts a target email or user ID from the request body.
- Deletes the user and associated workshop/seminar registrations. Payment records, contact submissions, and uploaded certificate files remain stored.
- Cognito and PostgreSQL do not support a shared atomic transaction. Cognito failures roll back database changes, but a database commit failure after successful Cognito deletion requires operator reconciliation of the remaining database records. Do not interpret a retry against an already absent Cognito identity as proof that those records were removed.
- Run `node --test tests/account-deletion.test.cjs` for mocked route tests. These do not contact Cognito or PostgreSQL.
- With a disposable staging account, verify Cancel does nothing, Confirm deletes the identity and database records, failures remain visible in the popup, repeated taps submit once, and success clears the mobile session and opens login. No live account deletion was performed during implementation.
