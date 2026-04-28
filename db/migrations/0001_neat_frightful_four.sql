CREATE TABLE "contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar,
	"mobile_number" varchar,
	"message" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "product_media" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "workshop_registration" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;