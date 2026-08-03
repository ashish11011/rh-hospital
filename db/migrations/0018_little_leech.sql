CREATE TABLE "course_review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer DEFAULT 0 NOT NULL,
	"feedback" varchar NOT NULL,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "product" CASCADE;--> statement-breakpoint
DROP TABLE "product_category" CASCADE;--> statement-breakpoint
DROP TABLE "product_media" CASCADE;--> statement-breakpoint
ALTER TABLE "course_enrolment" ADD COLUMN "course_certificate" varchar;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD COLUMN "is_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "rh_id" varchar;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "fcm_token" varchar;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "device_id" varchar;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_active" timestamp;--> statement-breakpoint
ALTER TABLE "course_review" ADD CONSTRAINT "course_review_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_review" ADD CONSTRAINT "course_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;