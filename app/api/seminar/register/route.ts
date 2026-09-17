import { user, payment, seminar, seminarRegistrations } from "@/db";
import { db } from "@/lib/dbConfig";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { userSchema } from "@/db/userSchema";
import { createHdfcCustomerId, createHdfcGatewayOrderId, createHdfcPaymentSession } from "@/lib/hdfcGateway";

export async function POST(req: NextRequest) {
    const data = await req.json();
    const { email, name, mobileNumber, designation, instituteName, city, registrationMode, isNaitMember, offlineDuration } = data;

    if (!email || !name || !mobileNumber || !designation || !instituteName || !city || !registrationMode) {
        return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    try {
        let userId;
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

        const [seminarDetail] = await db.select().from(seminar).limit(1);
        if (!seminarDetail) {
            return NextResponse.json({ message: "Seminar not found" }, { status: 404 });
        }
        const seminarId = seminarDetail.id;

        const isNait = isNaitMember === true;
        let payableAmount = 0;

        if (data.presentationType === "online_paper") {
            payableAmount = isNait ? 1400 : 1400;
        } else if (registrationMode === "online") {
            payableAmount = isNait ? 500 : 500;
        } else if (registrationMode === "offline" && offlineDuration === "one_day") {
            payableAmount = isNait ? 1500 : 1500;
        } else if (registrationMode === "offline" && offlineDuration === "two_day") {
            payableAmount = isNait ? 2500 : 2500;
        }

        const [registrationDetail] = await db.insert(seminarRegistrations).values({
            seminarId,
            userId,
            ...data,
            qualification: "",
            presentationType: data.presentationType === "paper" ? "paper" : data.presentationType === "poster" ? "poster" : data.presentationType === "online_paper" ? "online_paper" : data.presentationType === "both_offile" ? "both_offile" : null,
            referenceType: data.motivatedBy,
            amount: payableAmount.toString(),
            paymentStatus: "pending"
        }).returning({ id: seminarRegistrations.id });

        const gatewayOrderId = createHdfcGatewayOrderId();
        const hdfcPaymentSession = await createHdfcPaymentSession({
            gatewayOrderId,
            amount: payableAmount,
            customerId: createHdfcCustomerId(userId),
            customerEmail: email.toLowerCase(),
            customerPhone: mobileNumber,
            customerName: name,
            description: "Seminar registration payment",
        });

        await db.insert(payment).values({
            orderType: "seminar",
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
        console.log("Seminar Registration Error:", error);
        return NextResponse.json({ message: "Registration failed" }, { status: 500 });
    }
}
