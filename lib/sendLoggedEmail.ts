import { instrumentAwsClient } from "@/lib/logging/aws";

import { runLoggedOperation } from "@/lib/logging/operations";
import { createLogger } from "@/lib/logging/logger";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { AWS_ACCESS_KEY, AWS_SECRET_KEY } from "@/env";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/dbConfig";
import { emailLogsSchema } from "@/db/userSchema";
import { createEmailLogs, recordEmailFailure } from "@/lib/emailLogging";

const logger = createLogger("integration", "lib/sendLoggedEmail.ts");

const client = new SESClient({
  region: "ap-south-1",
  credentials: { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY },
});
instrumentAwsClient(client, "lib/sendLoggedEmail.ts");

export async function sendLoggedEmail(command: SendEmailCommand) {
  return runLoggedOperation(
    "integration",
    "lib/sendLoggedEmail.ts:sendLoggedEmail",
    async () => {
      const input = command.input;
      const destination = {
        ToAddresses: input.Destination?.ToAddresses?.map((email) =>
          email.trim().toLowerCase(),
        ),
        CcAddresses: input.Destination?.CcAddresses?.map((email) =>
          email.trim().toLowerCase(),
        ),
        BccAddresses: input.Destination?.BccAddresses?.map((email) =>
          email.trim().toLowerCase(),
        ),
      };
      const { ids, sendAttemptId } = await createEmailLogs(
        [
          ...(destination?.ToAddresses ?? []),
          ...(destination?.CcAddresses ?? []),
          ...(destination?.BccAddresses ?? []),
        ],
        input.Message?.Subject?.Data ?? "(subject unavailable)",
      );
      let result;
      try {
        result = await client.send(
          new SendEmailCommand({
            ...input,
            Destination: destination,
            ConfigurationSetName:
              input.ConfigurationSetName ?? process.env.SES_CONFIGURATION_SET,
            Tags: [
              ...(input.Tags ?? []).filter(
                (tag) => tag.Name !== "emailSendAttemptId",
              ),
              { Name: "emailSendAttemptId", Value: sendAttemptId },
            ],
          }),
        );
      } catch (error) {
        await recordEmailFailure(ids, error);
        throw error;
      }
      try {
        // SNS may have already advanced these rows using the attempt tag.
        await db
          .update(emailLogsSchema)
          .set({
            sesMessageId: result.MessageId,
            status: sql`case when ${emailLogsSchema.status} = 'pending' then 'sent' else ${emailLogsSchema.status} end`,
          })
          .where(
            and(
              inArray(emailLogsSchema.id, ids),
              eq(emailLogsSchema.sendAttemptId, sendAttemptId),
            ),
          );
        logger.info("[Email] SES accepted email", {
          details: [{ sendAttemptId, sesMessageId: result.MessageId }],
        });
      } catch (error) {
        // Preserve success: retrying would resend an already accepted email. SNS can repair via the tag.
        logger.error("[Email] SES accepted email but log update failed", {
          details: [{ sendAttemptId, sesMessageId: result.MessageId, error }],
        });
      }
      return result;
    },
  );
}
