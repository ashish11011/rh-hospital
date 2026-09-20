import { randomUUID } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/dbConfig";
import { emailLogsSchema, userSchema } from "@/db/userSchema";

export async function createEmailLogs(emails: string[], subject: string) {
  const sendAttemptId = randomUUID();
  const values = [];
  for (const email of new Set(emails)) {
    const users = await db.select({ id: userSchema.id }).from(userSchema)
      .where(sql`lower(${userSchema.email}) = ${email.toLowerCase()}`).limit(2);
    values.push({ email, subject, sendAttemptId, userId: users.length === 1 ? users[0].id : null,
      status: "pending", openedAt: null });
  }
  if (!values.length) throw new Error("Email has no recipients");
  const logs = await db.insert(emailLogsSchema).values(values).returning({ id: emailLogsSchema.id });
  console.log("[Email] Send attempt recorded", { sendAttemptId, recipients: logs.length });
  return { sendAttemptId, ids: logs.map((log) => log.id) };
}

export async function recordEmailFailure(ids: string[], error: unknown) {
  const reason = error instanceof Error ? error.message : String(error);
  try {
    await db.update(emailLogsSchema).set({ status: "failed", failureReason: reason })
      .where(and(inArray(emailLogsSchema.id, ids), eq(emailLogsSchema.status, "pending")));
  } catch (loggingError) {
    console.error("[Email] Failed to persist send failure", { ids, loggingError });
  }
  console.error("[Email] Send failed", { ids, reason });
}

// Cognito owns the template and transport; this records a request, not delivery.
export async function logCognitoEmail<T extends { CodeDeliveryDetails?: { DeliveryMedium?: string } }>(
  email: string, purpose: string, send: () => Promise<T>,
): Promise<T> {
  const { ids } = await createEmailLogs([email], `Cognito: ${purpose}`);
  let result: T;
  try { result = await send(); }
  catch (error) { await recordEmailFailure(ids, error); throw error; }
  const status = result.CodeDeliveryDetails?.DeliveryMedium === "EMAIL" ? "requested" : "not_sent";
  try {
    await db.update(emailLogsSchema).set({ status }).where(inArray(emailLogsSchema.id, ids));
    console.log("[Email] Cognito request completed", { ids, status });
  } catch (error) {
    // The provider already accepted the request. Do not invite a duplicate retry.
    console.error("[Email] Could not persist Cognito outcome", { ids, status, error });
  }
  return result;
}
