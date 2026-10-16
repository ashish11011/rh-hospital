ALTER TABLE "email_logs" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "email_logs" ADD COLUMN "send_attempt_id" uuid;--> statement-breakpoint
CREATE INDEX "email_logs_send_attempt_idx" ON "email_logs" USING btree ("send_attempt_id");