CREATE TYPE "public"."blog_status_enum" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."enrolment_status" AS ENUM('enrolled', 'pending', 'expired', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."item" AS ENUM('workshop', 'product', 'course', 'seminar');--> statement-breakpoint
CREATE TYPE "public"."modeOfAttandace" AS ENUM('online', 'offline');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."presentation_type" AS ENUM('presentation', 'poster', 'paper', 'online_paper', 'both_offile');--> statement-breakpoint
CREATE TYPE "public"."registrationSource" AS ENUM('website', 'whatsapp', 'facebook', 'instagram');--> statement-breakpoint
CREATE TYPE "public"."blood_group" AS ENUM('A', 'B', 'AB', 'O');--> statement-breakpoint
CREATE TYPE "public"."membership_purchase_type" AS ENUM('free', 'paid', 'referred', 'complimentary', 'admin');--> statement-breakpoint
CREATE TYPE "public"."rh_factor" AS ENUM('positive', 'negative');--> statement-breakpoint
CREATE TYPE "public"."user_gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_membership_type" AS ENUM('temporary');--> statement-breakpoint
CREATE TYPE "public"."user_profession" AS ENUM('nursing_student', 'nursing_officer', 'nursing_tutor', 'assistant_professor', 'associate_professor', 'professor', 'principal', 'hospital_administrator', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_qualification" AS ENUM('anm', 'gnm', 'bsc_nursing', 'pbbsc_nursing', 'msc_nursing', 'phd', 'other');--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"short_description" varchar(500),
	"content" text NOT NULL,
	"author_name" varchar(150) NOT NULL,
	"featured_image" text,
	"banner_image" text,
	"meta_title" varchar(255),
	"meta_description" varchar(300),
	"meta_keywords" text,
	"category" varchar(100),
	"tags" varchar[],
	"status" "blog_status_enum" DEFAULT 'published' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar,
	"mobile_number" varchar,
	"message" varchar,
	"created_at" timestamp DEFAULT now(),
	"form_source" varchar
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar NOT NULL,
	"content" varchar,
	"currency" varchar DEFAULT 'INR',
	"price" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"banner_image_url" varchar NOT NULL,
	"course_hours" integer DEFAULT 0 NOT NULL,
	"course_duration" varchar,
	"total_lectures" integer DEFAULT 0 NOT NULL,
	"slug" varchar NOT NULL,
	"course_overview" varchar,
	"what_you_will_learn" varchar[],
	"skills_acquired" varchar[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_enrolment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"enrolment_status" "enrolment_status" DEFAULT 'pending' NOT NULL,
	"course_certificate" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"media_url" varchar NOT NULL,
	"media_type" varchar NOT NULL,
	"title" varchar,
	"duration" varchar,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
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
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_item_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_type" "item" DEFAULT 'workshop' NOT NULL,
	"order_id" uuid NOT NULL,
	"currency" varchar DEFAULT 'INR' NOT NULL,
	"gateway_payment_event_id" varchar,
	"modeOf_payment" varchar,
	"geteway_payment_id" varchar,
	"gateway_invoice_id" varchar,
	"gateway_order_id" varchar NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"amount_due" integer DEFAULT 0 NOT NULL,
	"amount_paid" integer DEFAULT 0 NOT NULL,
	"transaction_id" varchar,
	"transaction_date" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'pending' NOT NULL,
	"email" varchar,
	"contact" varchar,
	"token_id" varchar,
	"response_object" jsonb,
	"fee" integer DEFAULT 0,
	"tax" integer DEFAULT 0,
	"vpa" varchar,
	"bank" varchar,
	"card_id" varchar,
	"notes" varchar,
	"description" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
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
	"address_line_1" text,
	"address_line_2" text,
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100),
	"pincode" varchar(20),
	"paper_presentation" boolean,
	"presentation_type" "presentation_type",
	"presentation_title" text,
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
	"certificate_url" varchar,
	"is_first_day_logged" boolean DEFAULT false,
	"is_second_day_logged" boolean DEFAULT false,
	"is_first_day_breakfast" boolean DEFAULT false,
	"is_first_day_lunch" boolean DEFAULT false,
	"is_second_day_breakfast" boolean DEFAULT false,
	"is_second_day_lunch" boolean DEFAULT false,
	"is_bag_given" boolean DEFAULT false,
	"qr_pdf_url" varchar,
	"qr_img_url" varchar,
	"ses_mail_id" varchar,
	"verification_url" varchar
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rh_id" varchar,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"mobile_number" varchar NOT NULL,
	"designation" varchar,
	"institute_name" varchar,
	"city" varchar,
	"is_active" boolean DEFAULT true,
	"is_varified_email" boolean DEFAULT false,
	"is_varified_mobile_number" boolean DEFAULT false,
	"password" varchar,
	"fcm_token" varchar,
	"device_id" varchar,
	"last_active" timestamp,
	"role" varchar DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
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
CREATE TABLE "workshop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"banner_image" varchar,
	"description" varchar NOT NULL,
	"content" varchar NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"online_price" integer NOT NULL,
	"offline_price" integer NOT NULL,
	"is_completed" boolean DEFAULT false,
	"whatsapp_link" varchar
);
--> statement-breakpoint
CREATE TABLE "coupon_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"online_discount" integer DEFAULT 0 NOT NULL,
	"offline_discount" integer DEFAULT 0 NOT NULL,
	"workshop_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workshop_id" uuid NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"image" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_registration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workshop_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar NOT NULL,
	"mobile_number" varchar NOT NULL,
	"designation" varchar NOT NULL,
	"institute_name" varchar NOT NULL,
	"city" varchar,
	"mode_of_attandnace" "modeOfAttandace" DEFAULT 'online' NOT NULL,
	"payment_status" "paymentStatus" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"workshop_amount" integer DEFAULT 0 NOT NULL,
	"coupon_discount" integer DEFAULT 0 NOT NULL,
	"payable_amount" integer DEFAULT 0 NOT NULL,
	"registration_source" "registrationSource" DEFAULT 'website',
	"utm_source" varchar,
	"utm_medium" varchar,
	"utm_campaign" varchar,
	"utm_content" varchar,
	"certificate_url" varchar
);
--> statement-breakpoint
ALTER TABLE "course_enrolment" ADD CONSTRAINT "course_enrolment_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrolment" ADD CONSTRAINT "course_enrolment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_item" ADD CONSTRAINT "course_item_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_review" ADD CONSTRAINT "course_review_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_review" ADD CONSTRAINT "course_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_course_item_id_course_item_id_fk" FOREIGN KEY ("course_item_id") REFERENCES "public"."course_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD CONSTRAINT "seminar_registrations_seminar_id_seminar_id_fk" FOREIGN KEY ("seminar_id") REFERENCES "public"."seminar"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seminar_registrations" ADD CONSTRAINT "seminar_registrations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_card" ADD CONSTRAINT "user_card_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_code" ADD CONSTRAINT "coupon_code_workshop_id_workshop_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshop"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_image" ADD CONSTRAINT "workshop_image_workshop_id_workshop_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshop"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registration" ADD CONSTRAINT "workshop_registration_workshop_id_workshop_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshop"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registration" ADD CONSTRAINT "workshop_registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blogs_status_idx" ON "blogs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blogs_category_idx" ON "blogs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "blogs_published_at_idx" ON "blogs" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_workshop_id_user_id_created_at" ON "workshop_registration" USING btree ("workshop_id","user_id","created_at");