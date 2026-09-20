# SES event tracking

1. Apply `docs/sql/ses-email-logs.sql` to the database before deploying this route (or apply equivalent schema changes with your normal Drizzle workflow).
2. Set `SES_SNS_TOPIC_ARN` to the exact topic ARN in the deployment environment.
3. Add an HTTPS SNS subscription pointing to `https://YOUR_DOMAIN/api/webhooks/ses`. Leave **raw message delivery disabled**. The endpoint verifies signed SNS messages and automatically confirms the subscription.
4. Configure an SES configuration set with that SNS topic as its event destination. Enable Send, Delivery, Bounce, Complaint, Reject, Open, Click, Rendering Failure, and DeliveryDelay events.
5. Associate that configuration set with your SES sending identity as its default, or pass `ConfigurationSetName` in each SES send command. Merely subscribing the endpoint does not cause SES to publish events.

The first event creates one email log per SES message ID and recipient. Subsequent events update it. A recipient must match exactly one existing user by email because `emailLogsSchema.userId` is required; other recipients are skipped with a warning. Older logs without an SES message ID cannot be reliably correlated and are left untouched. For sends that create a log themselves, save the returned SES `MessageId` in `sesMessageId`.

`status` values are `sent`, `delayed`, `delivered`, `opened`, `clicked`, `rejected`, `rendering_failed`, `bounced`, and `complained`. Higher-priority outcomes survive duplicate/out-of-order events; a bounce or complaint is not overwritten by a late delivery/open. `failureReason` stores available failure details. `openedAt` records the earliest reported Open timestamp, and remains null until then. Subscription preference events are acknowledged without changing delivery status because the schema has no preference fields.

Debug logs use the `[SES webhook]` prefix and include SNS/SES message IDs, event status, updated counts, confirmation, skipped recipients, and processing errors. They do not dump full messages, tokens, subjects, or recipient addresses. Database/network failures return 500 so SNS can retry; malformed/untrusted messages return 400, and missing configuration returns 503.

References: [SNS signature verification](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message-verify-message-signature.html), [SES event format](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html).
