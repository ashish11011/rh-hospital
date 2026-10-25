import { instrumentAwsClient } from "@/lib/logging/aws";

import { runLoggedOperation } from "@/lib/logging/operations";
import "server-only";

import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { eq } from "drizzle-orm";
import { payment } from "@/db";
import { db } from "@/lib/dbConfig";
import { createLogger } from "@/lib/logging/logger";

const logger = createLogger("integration", "lib/invoiceQueue.ts");

const sqsClient = new SQSClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_KEY!,
  },
});
instrumentAwsClient(sqsClient, "lib/invoiceQueue.ts");
const queueUrl =
  "https://sqs.ap-south-1.amazonaws.com/339712816914/RH_payment_Invoice_mail";

function readNotes(value: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const notes: unknown = JSON.parse(value);
    if (notes && typeof notes === "object" && !Array.isArray(notes)) {
      return notes as Record<string, unknown>;
    }
  } catch {
    // Retain legacy text notes when adding the queue acknowledgement.
  }
  return { previousNotes: value };
}

// Call only after payment and purchase fulfillment updates have committed.
export async function enqueuePaymentInvoice(paymentId: string) {
  return runLoggedOperation(
    "integration",
    "lib/invoiceQueue.ts:enqueuePaymentInvoice",
    async () => {
      const queued = await db.transaction(async (tx) => {
        const [record] = await tx
          .select({ status: payment.status, notes: payment.notes })
          .from(payment)
          .where(eq(payment.id, paymentId))
          .for("update");

        if (!record) throw new Error("Payment record not found");
        if (record.status !== "completed") return;
        const notes = readNotes(record.notes);
        if (typeof notes.invoiceQueuedAt === "string" && notes.invoiceQueuedAt)
          return;

        // Await SQS acknowledgement; errors propagate so a callback retry can enqueue.
        const result = await sqsClient.send(
          new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify({ paymentId }),
            DelaySeconds: 0,
          }),
        );

        await tx
          .update(payment)
          .set({
            notes: JSON.stringify({
              ...notes,
              invoiceQueuedAt: new Date().toISOString(),
            }),
          })
          .where(eq(payment.id, paymentId));
        return { sqsId: result.MessageId };
      });
      if (queued)
        logger.info("Invoice queued", { paymentId, sqsId: queued.sqsId });
    },
  );
}
