CREATE TABLE "coupon_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"online_discount" integer DEFAULT 0 NOT NULL,
	"offline_discount" integer DEFAULT 0 NOT NULL,
	"workshop_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coupon_code" ADD CONSTRAINT "coupon_code_workshop_id_workshop_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshop"("id") ON DELETE no action ON UPDATE no action;