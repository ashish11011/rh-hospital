ALTER TYPE "public"."presentation_type" ADD VALUE 'both_offile';--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "form_source" varchar;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_varified_email" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_varified_mobile_number" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "is_varified";