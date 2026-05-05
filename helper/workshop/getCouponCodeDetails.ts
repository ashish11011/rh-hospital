import { workshopCouponCodeSchema } from "@/db";
import { db } from "@/lib/dbConfig";
import { and, eq } from "drizzle-orm";

export async function getCouponCodeDetails(couponCode: string, workshopId: string) {
    if (!couponCode) {
        throw new Error("Coupon code is required");
    }

    const [couponDetail] = await db.select().from(workshopCouponCodeSchema).where(and(eq(workshopCouponCodeSchema.code, couponCode), eq(workshopCouponCodeSchema.workshopId, workshopId)));

    if (!couponDetail) throw new Error("Coupon code is invalid");

    return couponDetail;
}