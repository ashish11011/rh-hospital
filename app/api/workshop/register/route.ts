import { workshop, user, workshopRegistration, payment } from "@/db";
import { db } from "@/lib/dbConfig";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCouponCodeDetails } from "@/helper/workshop/getCouponCodeDetails";
import { createHdfcCustomerId, createHdfcGatewayOrderId, createHdfcPaymentSession } from "@/lib/hdfcGateway";
import { getWorkshopModePrice, isWorkshopRegistrationAllowed } from "@/lib/workshopAttendance";
import { getVerifiedWorkshopMember, workshopMemberDetails, WorkshopMemberError } from "@/lib/workshopMember";
import { memberCookieName } from "@/lib/workshopMemberOtp";
import { getWorkshopPricing } from "@/lib/workshopPricing";

const detailsSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    name: z.string().trim().min(1),
    mobileNumber: z.string().trim().min(10).max(15),
    designation: z.string().trim().min(1),
    instituteName: z.string().trim().min(1),
    city: z.string().trim().min(1),
});
const requestSchema = z.object({
    workshopId: z.string().min(1),
    modeOfAttandnace: z.string(),
    registrationType: z.enum(["regular", "member"]).default("regular"),
    couponCode: z.string().trim().optional(),
    registrationSource: z.enum(["website", "whatsapp", "facebook", "instagram"]).default("website"),
    utmSource: z.string().max(500).nullish(),
    utmMedium: z.string().max(500).nullish(),
    utmCampaign: z.string().max(500).nullish(),
    utmContent: z.string().max(500).nullish(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = requestSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ message: "Please check your registration details." }, { status: 400 });
        const { workshopId, modeOfAttandnace, couponCode, registrationSource, utmSource, utmMedium, utmCampaign, utmContent, registrationType } = parsed.data;
        const [workshopDetail] = await db.select().from(workshop).where(eq(workshop.id, workshopId));
        if (!workshopDetail) return NextResponse.json({ message: "Workshop not found." }, { status: 404 });
        if (workshopDetail.isCompleted) return NextResponse.json({ message: "This workshop is closed for registration." }, { status: 400 });
        if (!isWorkshopRegistrationAllowed(workshopDetail.attendanceMode, modeOfAttandnace)) {
            return NextResponse.json({ message: "The selected attendance mode is not available for this workshop. Please refresh and choose an available mode." }, { status: 400 });
        }

        const memberCard = registrationType === "member"
            ? await getVerifiedWorkshopMember(req.cookies.get(memberCookieName(workshopId))?.value, workshopId)
            : null;
        const savedDetails = memberCard ? workshopMemberDetails(memberCard) : null;
        // Identity always comes from the verified card. Only a missing institute may be supplied.
        const details = detailsSchema.safeParse(savedDetails
            ? { ...savedDetails, instituteName: savedDetails.instituteName || body.instituteName }
            : body);
        if (!details.success) return NextResponse.json({ message: "Please fill all the registration details with valid values." }, { status: 400 });
        const { email, name, mobileNumber, designation, instituteName, city } = details.data;
        if (memberCard && couponCode) return NextResponse.json({ message: "Membership discounts cannot be combined with coupons." }, { status: 400 });

        const workshopAmount = getWorkshopModePrice(workshopDetail, modeOfAttandnace);
        let requestedCouponDiscount = 0;
        if (couponCode) {
            try {
                const coupon = await getCouponCodeDetails(couponCode, workshopId);
                requestedCouponDiscount = modeOfAttandnace === "online" ? coupon.onlineDiscount : coupon.offlineDiscount;
                if (!Number.isInteger(requestedCouponDiscount) || requestedCouponDiscount < 0) throw new Error("Invalid coupon");
            } catch {
                return NextResponse.json({ message: "This coupon is invalid. Please remove it or use a valid coupon." }, { status: 400 });
            }
        }
        const pricing = getWorkshopPricing(workshopAmount, Boolean(memberCard), requestedCouponDiscount);
        let userId = memberCard?.userId;
        if (!userId) {
            const [existingUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
            if (existingUser) userId = existingUser.id;
            else {
                const [newUser] = await db.insert(user).values({ email, name, mobileNumber, designation, instituteName, password: "" }).returning({ id: user.id });
                userId = newUser.id;
            }
        }
        const [registration] = await db.insert(workshopRegistration).values({
            workshopId, userId, email, name, mobileNumber, designation, instituteName, city,
            modeOfAttandnace, workshopAmount, couponDiscount: pricing.couponDiscount,
            payableAmount: pricing.amount, registrationSource, utmSource, utmMedium, utmCampaign, utmContent,
        }).returning({ id: workshopRegistration.id });

        const gatewayOrderId = createHdfcGatewayOrderId();
        const session = await createHdfcPaymentSession({
            gatewayOrderId, amount: pricing.amount, customerId: createHdfcCustomerId(userId),
            customerEmail: email, customerPhone: mobileNumber, customerName: name,
            description: "Workshop registration payment",
        });
        await db.insert(payment).values({
            orderType: "workshop", orderId: registration.id, gatewayOrderId,
            gatewayInvoiceId: session.id, amount: pricing.amount, amountDue: pricing.amount,
            currency: "INR", email, contact: mobileNumber, status: session.status || "pending",
            responseObject: session as any,
            notes: JSON.stringify({
                originalAmount: workshopAmount, memberDiscount: pricing.memberDiscount,
                rhCardId: memberCard?.id || null, memberShipId: memberCard?.memberShipId || null,
            }),
        });
        return NextResponse.json({
            message: "Registration successful",
            data: {
                orderId: gatewayOrderId, gatewaySessionId: session.id, amount: pricing.amount,
                currency: "INR", status: session.status, paymentUrl: session.payment_links?.web,
                expiresAt: session.payment_links?.expiry || session.order_expiry,
            },
        });
    } catch (error) {
        if (error instanceof WorkshopMemberError) return NextResponse.json({ message: error.message }, { status: error.status });
        if (error instanceof SyntaxError) return NextResponse.json({ message: "Invalid request." }, { status: 400 });
        console.error("Workshop registration failed", error);
        return NextResponse.json({ message: "Registration failed. Please try again." }, { status: 500 });
    }
}
