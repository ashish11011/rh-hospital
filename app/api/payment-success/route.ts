import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendSeminarEmail, sendWorkshopEmail } from "@/lib/sesClient";
import { eq } from "drizzle-orm";
import { db } from "@/lib/dbConfig";
import { payment, seminarRegistrations, workshop, workshopRegistration } from "@/db";
import { RAZORPAY_WEBHOOK_SECRET } from "@/env";
export async function POST(req: NextRequest) {
    const rawBody = await req.text();

    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = RAZORPAY_WEBHOOK_SECRET;

    // ✅ Verify signature
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    if (expectedSignature !== signature) {
        return NextResponse.json(
            { success: false, message: "Invalid signature" },
            { status: 400 }
        );
    }

    const event = JSON.parse(rawBody);
    console.log("Signature conformed")
    // ✅ Handle payment.captured
    if (event.event === "payment.captured") {
        try {
            const paymentEventId = req.headers.get("x-razorpay-event-id");
            const [isAlreadyProcessed] = await db.select().from(payment).where(eq(payment.gatewayPaymentEventId, paymentEventId!));
            if (isAlreadyProcessed) return NextResponse.json({ received: false, message: "Already processed" }, { status: 200 });


            const gatewayPaymentResponse = event.payload.payment.entity;

            const dataToStore = {
                razorpay_payment_id: gatewayPaymentResponse.id,
                order_id: gatewayPaymentResponse.order_id,
                amount: gatewayPaymentResponse.amount, // in paise
                amount_in_rupees: gatewayPaymentResponse.amount / 100,
                invoice_id: gatewayPaymentResponse.invoice_id,
                currency: gatewayPaymentResponse.currency,
                status: gatewayPaymentResponse.status,
                modeOfgatewayPaymentResponse: gatewayPaymentResponse.method,
                captured: gatewayPaymentResponse.captured,
                email: gatewayPaymentResponse.email,
                contact: gatewayPaymentResponse.contact,
                fee: gatewayPaymentResponse.fee,
                tax: gatewayPaymentResponse.tax,
                wallet: gatewayPaymentResponse.wallet,
                vpa: gatewayPaymentResponse.vpa,
                bank: gatewayPaymentResponse.bank,
                card_id: gatewayPaymentResponse.card_id,
                notes: gatewayPaymentResponse.notes,
                description: gatewayPaymentResponse.description,
                created_at: new Date(gatewayPaymentResponse.created_at * 1000),
                raw_payload: gatewayPaymentResponse, // optional: store full object
            };

            // save to db.

            const [paymentUpdateResponse] = await db.update(payment).set({
                gatewayPaymentEventId: paymentEventId,
                modeOfPayment: dataToStore.modeOfgatewayPaymentResponse,
                status: dataToStore.status,
                amountPaid: dataToStore.amount,
                amountDue: 0,
                getewayPaymentId: dataToStore.razorpay_payment_id,
                gatewayInvoiceId: dataToStore.invoice_id,
                transactionId: dataToStore.razorpay_payment_id,


                email: dataToStore.email,
                contact: dataToStore.contact,
                fee: dataToStore.fee,
                tax: dataToStore.tax,

                vpa: dataToStore.vpa,
                bank: dataToStore.bank,
                cardId: dataToStore.card_id,
                notes: dataToStore.notes,
                description: dataToStore.description,
                createdAt: dataToStore.created_at,

            }).where(eq(payment.gatewayOrderId, dataToStore.order_id)).returning({
                id: payment.id,
                orderId: payment.orderId,
                email: payment.email,
                contact: payment.contact,
                registrationId: payment.orderId,
                orderType: payment.orderType
            });

            if (paymentUpdateResponse.orderType === "workshop") {
                // update status to workshopRegistration Table
                await db.update(workshopRegistration).set({ paymentStatus: "completed" }).where(eq(workshopRegistration.id, paymentUpdateResponse.registrationId));
                console.log("Database update done")
                // send email conformation.
                await sendWorkshopEmail({ toEmail: paymentUpdateResponse.email! });
                console.log("Email sent")
            }

            else if (paymentUpdateResponse.orderType === "seminar") {
                // update status to seminarRegistration Table
                await db.update(seminarRegistrations).set({ paymentStatus: "completed" }).where(eq(seminarRegistrations.id, paymentUpdateResponse.registrationId));
                console.log("Database update done")
                // send email conformation.
                await sendSeminarEmail({ toEmail: paymentUpdateResponse.email! });
                console.log("Email sent")
            }


            return NextResponse.json({ received: true }, { status: 200 });
        } catch (error) {
            console.log(error);
            return NextResponse.json({ received: false }, { status: 500 });
        }
    }

    return NextResponse.json({ message: "Not conformed" }, { status: 300 });
}


















































// x-razorpay-event-id


// {
//   "entity": "event",
//   "account_id": "acc_BFQ7uQEaa7j2z7",
//   "event": "payment.captured",
//   "contains": [
//     "payment"
//   ],
//   "payload": {
//     "payment": {
//       "entity": {
//         "id": "pay_DESlfW9H8K9uqM",
//         "entity": "payment",
//         "amount": 100,
//         "currency": "<currency>",
//         "base_amount": 100,
//         "status": "captured",
//         "order_id": "order_DESlLckIVRkHWj",
//         "invoice_id": null,
//         "international": false,
//         "method": "netbanking",
//         "amount_refunded": 0,
//         "amount_transferred": 0,
//         "refund_status": null,
//         "captured": true,
//         "description": null,
//         "card_id": null,
//         "bank": "HDFC",
//         "wallet": null,
//         "vpa": null,
//         "email": "<email>",
//         "contact": "<phone>",
//         "notes": [],
//         "fee": 2,
//         "tax": 0,
//         "error_code": null,
//         "error_description": null,
//         "error_source": null,
//         "error_step": null,
//         "error_reason": null,
//         "acquirer_data": {
//           "bank_transaction_id": "0125836177"
//         },
//         "created_at": 1567674599
//       }
//     }
//   },
//   "created_at": 1567674606
// }