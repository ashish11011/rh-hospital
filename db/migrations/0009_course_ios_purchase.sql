ALTER TABLE "course" ADD COLUMN "ios_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "ios_product_id" varchar(255);--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_ios_product_id_unique" UNIQUE("ios_product_id");