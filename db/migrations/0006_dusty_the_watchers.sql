CREATE TABLE "workshop_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workshop_id" uuid NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"image" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workshop_image" ADD CONSTRAINT "workshop_image_workshop_id_workshop_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshop"("id") ON DELETE cascade ON UPDATE no action;