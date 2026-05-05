ALTER TABLE "workshop_registration" ADD COLUMN "workshop_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "workshop_registration" ADD COLUMN "coupon_discount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "workshop_registration" ADD COLUMN "payable_amount" integer DEFAULT 0 NOT NULL;