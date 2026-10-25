import { runLoggedOperation } from "@/lib/logging/operations";
import { createLogger } from "@/lib/logging/logger";
import { randomUUID } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/dbConfig";
import { emailLogsSchema, userSchema } from "@/db/userSchema";

const logger = createLogger("resources", "lib/emailLogging.ts");

export async function createEmailLogs(emails: string[], subject: string) {
  return runLoggedOperation(
    "resources",
    "lib/emailLogging.ts:createEmailLogs",
    async () => {
      const sendAttemptId = randomUUID();
      const values = [];
      for (const email of new Set(
        emails.map((value) => value.trim().toLowerCase()),
      )) {
        const users = await db
          .select({ id: userSchema.id })
          .from(userSchema)
          .where(sql`lower(${userSchema.email}) = ${email.toLowerCase()}`)
          .limit(2);
        values.push({
          email,
          subject,
          sendAttemptId,
          userId: users.length === 1 ? users[0].id : null,
          status: "pending",
          openedAt: null,
        });
      }
      if (!values.length) throw new Error("Email has no recipients");
      const logs = await db
        .insert(emailLogsSchema)
        .values(values)
        .returning({ id: emailLogsSchema.id });
      logger.diagnostic("[Email] Send attempt recorded", {
        details: [{ sendAttemptId, recipients: logs.length }],
      });
      return { sendAttemptId, ids: logs.map((log) => log.id) };
    },
  );
}

export async function recordEmailFailure(ids: string[], error: unknown) {
  return runLoggedOperation(
    "resources",
    "lib/emailLogging.ts:recordEmailFailure",
    async () => {
      const reason = error instanceof Error ? error.message : String(error);
      try {
        await db
          .update(emailLogsSchema)
          .set({ status: "failed", failureReason: reason })
          .where(
            and(
              inArray(emailLogsSchema.id, ids),
              eq(emailLogsSchema.status, "pending"),
            ),
          );
      } catch (loggingError) {
        logger.error("[Email] Failed to persist send failure", {
          details: [{ ids, loggingError }],
        });
      }
      logger.error("[Email] Send failed", { ids, error });
    },
  );
}

// Cognito owns the template and transport; this records a request, not delivery.
export async function logCognitoEmail<
  T extends { CodeDeliveryDetails?: { DeliveryMedium?: string } },
>(email: string, purpose: string, send: () => Promise<T>): Promise<T> {
  return runLoggedOperation(
    "resources",
    "lib/emailLogging.ts:logCognitoEmail",
    async () => {
      const { ids } = await createEmailLogs([email], `Cognito: ${purpose}`);
      let result: T;
      try {
        result = await send();
      } catch (error) {
        await recordEmailFailure(ids, error);
        throw error;
      }
      const status =
        result.CodeDeliveryDetails?.DeliveryMedium === "EMAIL"
          ? "requested"
          : "not_sent";
      try {
        await db
          .update(emailLogsSchema)
          .set({ status })
          .where(inArray(emailLogsSchema.id, ids));
        logger.diagnostic("[Email] Cognito request completed", {
          details: [{ ids, status }],
        });
      } catch (error) {
        // The provider already accepted the request. Do not invite a duplicate retry.
        logger.error("[Email] Could not persist Cognito outcome", {
          details: [{ ids, status, error }],
        });
      }
      return result;
    },
  );
}
