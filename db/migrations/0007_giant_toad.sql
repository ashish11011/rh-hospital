CREATE TABLE "workshop_member_verification" (
	"card_id" uuid PRIMARY KEY NOT NULL,
	"workshop_id" uuid NOT NULL,
	"challenge_id" uuid NOT NULL,
	"email" varchar NOT NULL,
	"code_hash" varchar,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"sent_at" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"session_hash" varchar,
	"session_expires_at" timestamp with time zone,
	CONSTRAINT "workshop_member_verification_challenge_id_unique" UNIQUE("challenge_id")
);
--> statement-breakpoint
ALTER TABLE "workshop_member_verification" ADD CONSTRAINT "workshop_member_verification_card_id_user_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."user_card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_member_verification" ADD CONSTRAINT "workshop_member_verification_workshop_id_workshop_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshop"("id") ON DELETE cascade ON UPDATE no action;