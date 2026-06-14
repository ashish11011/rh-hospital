ALTER TYPE "public"."item" ADD VALUE 'seminar';--> statement-breakpoint
CREATE TABLE "seminar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"banner_image" varchar,
	"description" varchar NOT NULL,
	"content" varchar NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"online_price" integer,
	"offline_price" integer,
	"is_completed" boolean DEFAULT false,
	"whatsapp_link" varchar
);
--> statement-breakpoint
CREATE TABLE "seminar_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seminar_id" uuid NOT NULL,
	"user_id" uuid,
	"name" varchar(255) NOT NULL,
	"gender" varchar(20) NOT NULL,
	"mobile_number" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"designation" varchar(255) NOT NULL,
	"qualification" varchar(255) NOT NULL,
	"institute_name" varchar(255) NOT NULL,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"pincode" varchar(20) NOT NULL,
	"paper_presentation" boolean NOT NULL,
	"paper_title" text,
	"author_name" varchar(255),
	"paper_institution" varchar(255),
	"additional_details" text,
	"reference_type" varchar(50) NOT NULL,
	"reference_person_name" varchar(255),
	"reference_person_mobile" varchar(20),
	"social_media_name" varchar(255),
	"registration_mode" varchar(20) NOT NULL,
	"offline_duration" varchar(20),
	"is_nait_member" boolean NOT NULL,
	"nait_registration_id" varchar(100),
	"amount" varchar(20) NOT NULL,
	"payment_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_id" varchar(255),
	"order_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"utm_source" varchar,
	"utm_medium" varchar,
	"utm_campaign" varchar,
	"utm_content" varchar,
	"certificate_url" varchar
);
--> statement-breakpoint
ALTER TABLE "workshop" ADD COLUMN "whatsapp_link" varchar;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD CONSTRAINT "seminar_registrations_seminar_id_seminar_id_fk" FOREIGN KEY ("seminar_id") REFERENCES "public"."seminar"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD CONSTRAINT "seminar_registrations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;