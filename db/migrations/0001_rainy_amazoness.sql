CREATE TABLE "email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"failure_reason" varchar,
	"ses_message_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"opened_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "apple_original_transaction_id" varchar;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "apple_environment" varchar;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "apple_product_id" varchar;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "apple_account_token" uuid;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "apple_price_milliunits" integer;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_logs_ses_message_recipient_idx" ON "email_logs" USING btree ("ses_message_id","email");