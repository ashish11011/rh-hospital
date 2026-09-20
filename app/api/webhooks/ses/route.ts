import { NextResponse } from "next/server";
import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/dbConfig";
import { emailLogsSchema, userSchema } from "@/db/userSchema";
import { eventUpdate, sesEventSchema, signingString, SnsRequestError, snsHost, snsSchema, statusPriority, verifySnsMessage } from "@/lib/sesWebhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const topicArn = process.env.SES_SNS_TOPIC_ARN;
    if (!topicArn) {
      console.error("[SES webhook] SES_SNS_TOPIC_ARN is not configured");
      return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
    }
    // SNS uses text/plain by default, so do not require application/json.
    let body: unknown;
    try { body = JSON.parse(await request.text()); }
    catch { throw new SnsRequestError("Invalid JSON body"); }
    const parsed = snsSchema.safeParse(body);
    if (!parsed.success) throw new SnsRequestError("Invalid SNS envelope");
    const message = parsed.data;
    if (message.TopicArn !== topicArn) throw new SnsRequestError("Unexpected SNS topic");
    await verifySnsMessage(message);
    console.log("[SES webhook] Verified SNS message", { type: message.Type, snsMessageId: message.MessageId });

    if (message.Type === "SubscriptionConfirmation") {
      signingString(message); // Requires the signed confirmation token and URL.
      const url = new URL(`https://${snsHost(topicArn)}/`);
      url.searchParams.set("Action", "ConfirmSubscription");
      url.searchParams.set("TopicArn", topicArn);
      url.searchParams.set("Token", message.Token!);
      const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`SNS confirmation failed: ${response.status}`);
      console.log("[SES webhook] Subscription confirmed", { topicArn });
      return NextResponse.json({ received: true, subscribed: true });
    }
    if (message.Type === "UnsubscribeConfirmation") {
      console.warn("[SES webhook] Subscription removed", { topicArn });
      return NextResponse.json({ received: true });
    }
    let payload: unknown;
    try { payload = JSON.parse(message.Message); }
    catch { throw new SnsRequestError("Invalid SES JSON"); }
    const event = sesEventSchema.safeParse(payload);
    if (!event.success) throw new SnsRequestError("Invalid SES event");
    const update = eventUpdate(event.data);
    if (!update) {
      console.log("[SES webhook] Ignoring unsupported event", { eventType: event.data.eventType ?? event.data.notificationType });
      return NextResponse.json({ received: true, ignored: true });
    }
    const mail = event.data.mail;
    const attemptTag = mail.tags?.emailSendAttemptId?.[0];
    const sendAttemptId = attemptTag && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attemptTag) ? attemptTag : undefined;
    let updated = 0;
    await db.transaction(async (tx) => {
      // Serialize all recipients for a message, including first-event inserts.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${mail.messageId}, 0))`);
      for (const email of new Set(update.recipients)) {
        const [existing] = await tx.select().from(emailLogsSchema).where(and(
          or(eq(emailLogsSchema.sesMessageId, mail.messageId),
            sendAttemptId ? eq(emailLogsSchema.sendAttemptId, sendAttemptId) : undefined),
          eq(emailLogsSchema.email, email),
        )).limit(1);
        const failureReason = update.diagnostics?.find((item) => item.emailAddress === email)?.diagnosticCode ?? update.failureReason;
        if (existing) {
          const advance = statusPriority[update.status] > (statusPriority[existing.status] ?? -1);
          const openedAt = update.openedAt && (!existing.openedAt || update.openedAt < existing.openedAt)
            ? update.openedAt : existing.openedAt;
          await tx.update(emailLogsSchema).set({
            sesMessageId: mail.messageId,
            status: advance ? update.status : existing.status,
            failureReason: advance ? failureReason : existing.failureReason,
            openedAt,
          }).where(eq(emailLogsSchema.id, existing.id));
        } else {
          const users = await tx.select({ id: userSchema.id }).from(userSchema)
            .where(sql`lower(${userSchema.email}) = ${email.toLowerCase()}`).limit(2);
          await tx.insert(emailLogsSchema).values({
            userId: users.length === 1 ? users[0].id : null, email, subject: mail.commonHeaders?.subject ?? "(subject unavailable)",
            sesMessageId: mail.messageId, status: update.status, failureReason,
            createdAt: new Date(mail.timestamp), openedAt: update.openedAt,
          });
        }
        updated++;
      }
    });
    console.log("[SES webhook] Event processed", { sesMessageId: mail.messageId, status: update.status, updated, recipients: update.recipients.length });
    return NextResponse.json({ received: true, updated });
  } catch (error) {
    console.error("[SES webhook] Processing failed", error);
    return NextResponse.json({ error: error instanceof SnsRequestError ? error.message : "Unable to process SES event" },
      { status: error instanceof SnsRequestError ? 400 : 500 });
  }
}
