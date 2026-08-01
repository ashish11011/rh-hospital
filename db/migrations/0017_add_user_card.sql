CREATE TYPE "public"."user_membership_type" AS ENUM('temporary');--> statement-breakpoint
CREATE TYPE "public"."user_profession" AS ENUM('nursing_student', 'nursing_officer', 'nursing_tutor', 'assistant_professor', 'associate_professor', 'professor', 'principal', 'hospital_administrator', 'other');--> statement-breakpoint
CREATE TYPE "public"."blood_group" AS ENUM('A', 'B', 'AB', 'O');--> statement-breakpoint
CREATE TYPE "public"."rh_factor" AS ENUM('positive', 'negative');--> statement-breakpoint
CREATE TYPE "public"."user_qualification" AS ENUM('anm', 'gnm', 'bsc_nursing', 'pbbsc_nursing', 'msc_nursing', 'phd', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."membership_purchase_type" AS ENUM('free', 'paid', 'referred', 'complimentary', 'admin');--> statement-breakpoint
CREATE TABLE "user_card" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"member_ship_number" serial NOT NULL,
	"member_ship_id" varchar,
	"membership_type" "user_membership_type" DEFAULT 'temporary' NOT NULL,
	"full_name" varchar NOT NULL,
	"mobile_number" varchar NOT NULL,
	"email" varchar NOT NULL,
	"gender" "user_gender" NOT NULL,
	"blood_group" "blood_group",
	"rh_factor" "rh_factor",
	"date_of_birth" timestamp,
	"state" varchar NOT NULL,
	"city" varchar NOT NULL,
	"profession" "user_profession" DEFAULT 'other' NOT NULL,
	"qualification" "user_qualification" DEFAULT 'other' NOT NULL,
	"organization_name" varchar,
	"passport_photo" varchar,
	"referral_code" varchar,
	"hear_about_rh" varchar,
	"terms_accepted" boolean DEFAULT false NOT NULL,
	"activation_date" timestamp,
	"validity_date" timestamp,
	"card_type" varchar NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"membership_purchase_type" "membership_purchase_type" DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_card" ADD CONSTRAINT "user_card_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
