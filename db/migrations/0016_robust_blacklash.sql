CREATE TYPE "public"."enrolment_status" AS ENUM('enrolled', 'pending', 'expired', 'refunded');--> statement-breakpoint
CREATE TABLE "course_enrolment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"enrolment_status" "enrolment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_item_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "course_hours" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "course_duration" varchar;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "total_lectures" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "slug" varchar NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "slug" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "course_overview" varchar;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "what_you_will_learn" varchar[];--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "skills_acquired" varchar[];--> statement-breakpoint
ALTER TABLE "course_item" ADD COLUMN "title" varchar;--> statement-breakpoint
ALTER TABLE "course_item" ADD COLUMN "duration" varchar;--> statement-breakpoint
ALTER TABLE "course_enrolment" ADD CONSTRAINT "course_enrolment_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrolment" ADD CONSTRAINT "course_enrolment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_course_item_id_course_item_id_fk" FOREIGN KEY ("course_item_id") REFERENCES "public"."course_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "image";