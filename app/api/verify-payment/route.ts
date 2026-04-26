import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { paymentClient } from "@/lib/paymentClient";


export async function POST(req: NextRequest) {
    const body = await req.json();

    const { razorpay_payment_id } = body;
    const payment = await paymentClient.payments.fetch(razorpay_payment_id);
    console.log(payment);
    if (payment.status === "captured") {
        return NextResponse.json({ success: true, status: payment.status }, { status: 200 });
    } else {
        return NextResponse.json({ success: false, status: payment.status }, { status: 400 });
    }
}