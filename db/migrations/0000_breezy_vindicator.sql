CREATE TYPE "public"."item" AS ENUM('workshop', 'product', 'course');--> statement-breakpoint
CREATE TYPE "public"."modeOfAttandace" AS ENUM('online', 'offline');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TABLE "course" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar NOT NULL,
	"content" varchar NOT NULL,
	"image" varchar NOT NULL,
	"currency" varchar DEFAULT 'INR',
	"is_active" boolean DEFAULT true,
	"banner_image_url" varchar NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"media_url" varchar NOT NULL,
	"media_type" varchar NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_type" "item" DEFAULT 'workshop' NOT NULL,
	"order_id" uuid NOT NULL,
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
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar NOT NULL,
	"image" varchar NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"min_quantity" integer DEFAULT 1 NOT NULL,
	"max_quantity" integer DEFAULT 1 NOT NULL,
	"color" varchar,
	"size" varchar
);
--> statement-breakpoint
CREATE TABLE "product_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar NOT NULL,
	"image_url" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"media_url" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"priority" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"mobile_number" varchar NOT NULL,
	"is_varified" boolean DEFAULT false,
	"designation" varchar NOT NULL,
	"institute_name" varchar NOT NULL,
	"city" varchar,
	"is_active" boolean DEFAULT true,
	"password" varchar NOT NULL,
	"role" varchar DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
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
	"offline_price" integer NOT NULL
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
	"payment_status" "paymentStatus" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_item" ADD CONSTRAINT "course_item_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshop_registration" ADD CONSTRAINT "workshop_registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;