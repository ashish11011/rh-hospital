import { workshop, user, workshopRegistration, payment } from "@/db";
import { db } from "@/lib/dbConfig";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { userSchema } from "@/db/userSchema";
import { paymentClient } from "@/lib/paymentClient";
import { getCouponCodeDetails } from "@/helper/workshop/getCouponCodeDetails";


export async function POST(req: NextRequest) {
    const { workshopId, email, name, mobileNumber, designation, instituteName, city, modeOfAttandnace, couponCode } = await req.json();
    if (!email || !name || !mobileNumber || !designation || !instituteName || !city || !modeOfAttandnace || !workshopId) return NextResponse.json({ message: "All fields are required" });
    let userId;
    // Take userId
    const [userDetail] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
    if (!userDetail) {
        const [newUser] = await db.insert(userSchema).values({
            email,
            name,
            mobileNumber,
            designation,
            instituteName,
            password: ""
        }).returning({ id: userSchema.id });
        userId = newUser.id;
    } else {
        userId = userDetail.id;
    }

    // get workshop details
    const [workshopDetail] = await db.select().from(workshop).where(eq(workshop.id, workshopId));

    if (!workshopDetail) return notFound();

    let workshopAmount = modeOfAttandnace === "online" ? workshopDetail.onlinePrice : workshopDetail.offlinePrice;
    let couponDiscount = 0;
    if (couponCode) {
        const couponDetail: any = await getCouponCodeDetails(couponCode, workshopId);
        couponDiscount = modeOfAttandnace === "online" ? couponDetail?.onlineDiscount : couponDetail?.offlineDiscount;
    }
    let payableAmount = workshopAmount - couponDiscount;
    try {
        const [registrationDetail] = await db.insert(workshopRegistration).values({
            workshopId,
            userId: userId,
            email,
            name,
            mobileNumber,
            designation,
            instituteName,
            city,
            modeOfAttandnace,
            workshopAmount,
            couponDiscount,
            payableAmount,
        }).returning({ id: workshopRegistration.id });

        var options = {
            amount: payableAmount * 100,
            currency: "INR",
            receipt: registrationDetail.id
        };

        const gatewayPaymentOrder = await paymentClient.orders.create(options);
        console.log(gatewayPaymentOrder);

        await db.insert(payment).values({
            orderType: "workshop",
            orderId: registrationDetail.id,
            gatewayOrderId: gatewayPaymentOrder.id,
            amount: payableAmount,
            amountDue: payableAmount,
            currency: gatewayPaymentOrder.currency,
            email: email,
            contact: mobileNumber,
        });

        return NextResponse.json({ message: "Registration successful", data: gatewayPaymentOrder });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Registration failed" });
    }
}
