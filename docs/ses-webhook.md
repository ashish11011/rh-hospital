# SES event tracking

1. Apply `docs/sql/ses-email-logs.sql` followed by `docs/sql/email-send-logging.sql` to the database before deploying this route (or apply equivalent schema changes with your normal Drizzle workflow).
2. Set `SES_SNS_TOPIC_ARN` to the exact topic ARN in the deployment environment.
3. Add an HTTPS SNS subscription pointing to `https://YOUR_DOMAIN/api/webhooks/ses`. Leave **raw message delivery disabled**. The endpoint verifies signed SNS messages and automatically confirms the subscription.
4. Configure an SES configuration set with that SNS topic as its event destination. Enable Send, Delivery, Bounce, Complaint, Reject, Open, Click, Rendering Failure, and DeliveryDelay events.
5. Associate that configuration set with your SES sending identity as its default, or pass `ConfigurationSetName` in each SES send command. Merely subscribing the endpoint does not cause SES to publish events.

Every application SES send creates a pending log per recipient before contacting SES. The shared sender saves the SES message ID on acceptance, and records `failed` plus the error on rejection. It attaches an `emailSendAttemptId` tag so a fast SNS event can find the pending rows before the send response is saved. Set `SES_CONFIGURATION_SET` to attach the event configuration set automatically, or configure a default on the SES identity.

Webhook events update the same rows. Events for sends outside the application create a log if none exists. The user link is optional for administrator recipients and new signups; it is populated when exactly one user matches the recipient address. Historical rows without correlation IDs are left untouched.

Web and mobile Cognito signup, verification resend, and password-reset requests also create logs. These use descriptive `Cognito: ...` subjects (the actual templates are managed by Cognito). Their statuses are `requested` when Cognito reports EMAIL, `not_sent` when it does not report email delivery, and `failed` on API errors. These are request outcomes, not confirmed delivery, and Cognito does not return an SES message ID. Signup logs may have no user link because the application user is created afterward.

If initial log creation fails, sending is stopped. If SES accepts a send but saving the response fails, the existing pending log remains and an error is printed; SNS can reconcile it using the attempt tag. The sender does not throw in that case, avoiding a duplicate send caused by caller retries.

`status` values are `sent`, `delayed`, `delivered`, `opened`, `clicked`, `rejected`, `rendering_failed`, `bounced`, and `complained`. Higher-priority outcomes survive duplicate/out-of-order events; a bounce or complaint is not overwritten by a late delivery/open. `failureReason` stores available failure details. `openedAt` records the earliest reported Open timestamp, and remains null until then. Subscription preference events are acknowledged without changing delivery status because the schema has no preference fields.

Debug logs use the `[SES webhook]` prefix and include SNS/SES message IDs, event status, updated counts, confirmation and processing errors. They do not dump full messages, tokens, subjects, or recipient addresses. Database/network failures return 500 so SNS can retry; malformed/untrusted messages return 400, and missing configuration returns 503.

References: [SNS signature verification](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message-verify-message-signature.html), [SES event format](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html).
