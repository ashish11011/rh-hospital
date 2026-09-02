ALTER TABLE "seminar_registrations" ADD COLUMN "is_first_day_logged" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD COLUMN "is_second_day_logged" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD COLUMN "is_first_day_breakfast" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD COLUMN "is_first_day_lunch" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD COLUMN "is_second_day_breakfast" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD COLUMN "is_second_day_lunch" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD COLUMN "is_bag_given" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD COLUMN "qr_pdf_url" varchar;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD COLUMN "qr_img_url" varchar;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD COLUMN "ses_mail_id" varchar;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD COLUMN "verification_url" varchar;