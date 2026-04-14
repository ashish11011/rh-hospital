CREATE TYPE "public"."modeOfAttandace" AS ENUM('online', 'offline');--> statement-breakpoint
CREATE TABLE "workshop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"banner_image" varchar,
	"description" varchar NOT NULL,
	"content" varchar NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"online_price" integer NOT NULL,
	"offline_price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid NOT NULL,
	"currency" varchar DEFAULT 'INR' NOT NULL,
	"modeOf_payment" varchar,
	"gateway_order_id" varchar NOT NULL,
	"amount" varchar NOT NULL,
	"transaction_id" varchar NOT NULL,
	"transaction_date" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"email" varchar,
	"contact" varchar,
	"token_id" varchar,
	"response_object" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_registration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workshop_id" uuid NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar NOT NULL,
	"mobile_number" varchar NOT NULL,
	"designation" varchar NOT NULL,
	"institute_name" varchar NOT NULL,
	"city" varchar,
	"mode_of_attandnace" "modeOfAttandace" DEFAULT 'online' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workshop_payment" ADD CONSTRAINT "workshop_payment_registration_id_workshop_registration_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."workshop_registration"("id") ON DELETE no action ON UPDATE no action;