import { verify } from "node:crypto";
import { z } from "zod";

export class SnsRequestError extends Error {}

export const snsSchema = z.object({
  Type: z.enum(["Notification", "SubscriptionConfirmation", "UnsubscribeConfirmation"]),
  MessageId: z.string().min(1),
  TopicArn: z.string().min(1),
  Message: z.string(),
  Timestamp: z.string(),
  SignatureVersion: z.enum(["1", "2"]),
  Signature: z.string().min(1),
  SigningCertURL: z.string().url(),
  Subject: z.string().optional(),
  Token: z.string().optional(),
  SubscribeURL: z.string().optional(),
});
type SnsMessage = z.infer<typeof snsSchema>;

export function snsHost(topicArn: string) {
  const match = /^arn:(aws|aws-cn):sns:([a-z0-9-]+):\d{12}:[a-zA-Z0-9_-]+$/.exec(topicArn);
  if (!match) throw new SnsRequestError("Invalid SNS topic ARN");
  return `sns.${match[2]}.amazonaws.com${match[1] === "aws-cn" ? ".cn" : ""}`;
}

export function signingString(message: SnsMessage) {
  const fields = message.Type === "Notification"
    ? ["Message", "MessageId", ...(message.Subject !== undefined ? ["Subject"] : []), "Timestamp", "TopicArn", "Type"]
    : ["Message", "MessageId", "SubscribeURL", "Timestamp", "Token", "TopicArn", "Type"];
  return fields.map((field) => {
    const value = message[field as keyof SnsMessage];
    if (typeof value !== "string") throw new SnsRequestError(`Missing SNS ${field}`);
    return `${field}\n${value}\n`;
  }).join("");
}

export async function verifySnsMessage(message: SnsMessage) {
  const url = new URL(message.SigningCertURL);
  if (url.protocol !== "https:" || url.hostname !== snsHost(message.TopicArn) ||
      url.port || url.username || url.password || url.search || url.hash ||
      !/^\/SimpleNotificationService-[a-zA-Z0-9_-]+\.pem$/.test(url.pathname)) {
    throw new SnsRequestError("Invalid SNS signing certificate URL");
  }
  const canonical = signingString(message);
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`SNS certificate fetch failed: ${response.status}`);
  const certificate = await response.text();
  if (!verify(message.SignatureVersion === "1" ? "RSA-SHA1" : "RSA-SHA256",
      Buffer.from(canonical), certificate, Buffer.from(message.Signature, "base64"))) {
    throw new SnsRequestError("Invalid SNS signature");
  }
}

const recipient = z.object({ emailAddress: z.string().email(), diagnosticCode: z.string().optional() });
const detail = z.object({
  timestamp: z.string().datetime({ offset: true }).optional(),
  recipients: z.array(z.string().email()).optional(),
  bouncedRecipients: z.array(recipient).optional(),
  complainedRecipients: z.array(recipient).optional(),
  delayedRecipients: z.array(recipient).optional(),
  bounceType: z.string().optional(),
  bounceSubType: z.string().optional(),
  complaintFeedbackType: z.string().optional(),
  reason: z.string().optional(),
  errorMessage: z.string().optional(),
  delayType: z.string().optional(),
});
export const sesEventSchema = z.object({
  eventType: z.string().optional(),
  notificationType: z.string().optional(),
  mail: z.object({
    messageId: z.string().min(1),
    timestamp: z.string().datetime({ offset: true }),
    destination: z.array(z.string().email()).min(1),
    tags: z.record(z.string(), z.array(z.string())).optional(),
    commonHeaders: z.object({ subject: z.string().optional() }).optional(),
  }),
  send: detail.optional(), delivery: detail.optional(), bounce: detail.optional(),
  complaint: detail.optional(), reject: detail.optional(), open: detail.optional(),
  click: detail.optional(), failure: detail.optional(), deliveryDelay: detail.optional(),
  subscription: detail.optional(),
});

// Higher-priority states survive duplicate or out-of-order SNS deliveries.
export const statusPriority: Record<string, number> = {
  pending: 0, sent: 1, delayed: 2, delivered: 3, opened: 4, clicked: 5,
  rejected: 6, rendering_failed: 6, bounced: 7, complained: 8,
};
export function eventUpdate(event: z.infer<typeof sesEventSchema>) {
  const type = event.eventType ?? event.notificationType;
  const mapping = {
    Send: ["sent", event.send], Delivery: ["delivered", event.delivery],
    Bounce: ["bounced", event.bounce], Complaint: ["complained", event.complaint],
    Reject: ["rejected", event.reject], Open: ["opened", event.open],
    Click: ["clicked", event.click], "Rendering Failure": ["rendering_failed", event.failure],
    DeliveryDelay: ["delayed", event.deliveryDelay],
  } as const;
  if (!type || !Object.prototype.hasOwnProperty.call(mapping, type)) return null;
  const [status, data] = mapping[type as keyof typeof mapping];
  const affected = data?.bouncedRecipients ?? data?.complainedRecipients ?? data?.delayedRecipients;
  const recipients = affected?.map((item) => item.emailAddress) ?? data?.recipients ?? event.mail.destination;
  const reason = [data?.reason, data?.errorMessage, data?.bounceType, data?.bounceSubType,
    data?.complaintFeedbackType, data?.delayType].filter(Boolean).join("; ");
  return {
    status, recipients,
    openedAt: type === "Open" && data?.timestamp ? new Date(data.timestamp) : null,
    failureReason: ["bounced", "complained", "rejected", "rendering_failed", "delayed"].includes(status)
      ? reason || status : null,
    diagnostics: affected,
  };
}
