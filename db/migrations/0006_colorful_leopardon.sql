CREATE TYPE "public"."workshop_attendance_mode" AS ENUM('online', 'offline', 'both');--> statement-breakpoint
ALTER TABLE "workshop_registration" DROP CONSTRAINT "workshop_registration_workshop_id_workshop_id_fk";
--> statement-breakpoint
ALTER TABLE "workshop_registration" DROP CONSTRAINT "workshop_registration_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "workshop" ADD COLUMN "attendance_mode" "workshop_attendance_mode" DEFAULT 'both' NOT NULL;--> statement-breakpoint
ALTER TABLE "workshop_registration" ADD CONSTRAINT "workshop_registration_workshop_id_workshop_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshop"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registration" ADD CONSTRAINT "workshop_registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;