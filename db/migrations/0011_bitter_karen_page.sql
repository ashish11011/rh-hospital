CREATE TYPE "public"."presentation_type" AS ENUM('presentation', 'poster');--> statement-breakpoint
ALTER TABLE "seminar_registrations" RENAME COLUMN "paper_title" TO "presentation_title";--> statement-breakpoint
ALTER TABLE "seminar_registrations" ALTER COLUMN "address_line_1" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ALTER COLUMN "state" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ALTER COLUMN "pincode" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ALTER COLUMN "paper_presentation" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD COLUMN "presentation_type" "presentation_type";