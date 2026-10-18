import { workshop, user, workshopRegistration, payment } from "@/db";
import { db } from "@/lib/dbConfig";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { userSchema } from "@/db/userSchema";
import { getCouponCodeDetails } from "@/helper/workshop/getCouponCodeDetails";
import { createHdfcCustomerId, createHdfcGatewayOrderId, createHdfcPaymentSession } from "@/lib/hdfcGateway";
import { getWorkshopModePrice, isWorkshopRegistrationAllowed } from "@/lib/workshopAttendance";


export async function POST(req: NextRequest) {
    const { workshopId, email, name, mobileNumber, designation, instituteName, city, modeOfAttandnace, couponCode, registrationSource, utmSource, utmMedium, utmCampaign, utmContent } = await req.json();
    if (!email || !name || !mobileNumber || !designation || !instituteName || !city || !modeOfAttandnace || !workshopId) return NextResponse.json({ message: "All fields are required" });

    const [workshopDetail] = await db.select().from(workshop).where(eq(workshop.id, workshopId));
    if (!workshopDetail) return notFound();
    if (!isWorkshopRegistrationAllowed(workshopDetail.attendanceMode, modeOfAttandnace)) {
        return NextResponse.json(
            { message: "The selected attendance mode is not available for this workshop. Please refresh and choose an available mode." },
            { status: 400 },
        );
    }

    let userId;
    // Take userId
    const [userDetail] = await db.select({ id: user.id }).from(user).where(eq(user.email, email.toLowerCase()));
    if (!userDetail) {
        const [newUser] = await db.insert(userSchema).values({
            email: email.toLowerCase(),
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

    let workshopAmount = getWorkshopModePrice(workshopDetail, modeOfAttandnace);
    let couponDiscount = 0;
    try {
        if (couponCode) {
            const couponDetail: any = await getCouponCodeDetails(couponCode, workshopId);
            couponDiscount = modeOfAttandnace === "online" ? couponDetail?.onlineDiscount : couponDetail?.offlineDiscount;
        }
    } catch (error) {
        console.log(error)
    }
    let payableAmount = workshopAmount - couponDiscount;
    try {
        const [registrationDetail] = await db.insert(workshopRegistration).values({
            workshopId,
            userId: userId,
            email: email.toLowerCase(),
            name,
            mobileNumber,
            designation,
            instituteName,
            city,
            modeOfAttandnace,
            workshopAmount,
            couponDiscount,
            payableAmount,
            registrationSource,
            utmSource,
            utmMedium,
            utmCampaign,
            utmContent
        }).returning({ id: workshopRegistration.id });

        const gatewayOrderId = createHdfcGatewayOrderId();
        const hdfcPaymentSession = await createHdfcPaymentSession({
            gatewayOrderId,
            amount: payableAmount,
            customerId: createHdfcCustomerId(userId),
            customerEmail: email.toLowerCase(),
            customerPhone: mobileNumber,
            customerName: name,
            description: "Workshop registration payment",
        });

        await db.insert(payment).values({
            orderType: "workshop",
            orderId: registrationDetail.id,
            gatewayOrderId,
            gatewayInvoiceId: hdfcPaymentSession.id,
            amount: payableAmount,
            amountDue: payableAmount,
            currency: "INR",
            email: email.toLowerCase(),
            contact: mobileNumber,
            status: hdfcPaymentSession.status || "pending",
            responseObject: hdfcPaymentSession as any,
        });

        return NextResponse.json({
            message: "Registration successful",
            data: {
                orderId: gatewayOrderId,
                gatewaySessionId: hdfcPaymentSession.id,
                amount: payableAmount,
                currency: "INR",
                status: hdfcPaymentSession.status,
                paymentUrl: hdfcPaymentSession.payment_links?.web,
                expiresAt: hdfcPaymentSession.payment_links?.expiry || hdfcPaymentSession.order_expiry,
            }
        });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Registration failed" });
    }
}
