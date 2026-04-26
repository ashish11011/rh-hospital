import { NextRequest, NextResponse } from "next/server";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

export function POST(req: NextRequest) {
    console.log(req);
    const body: any = req.body;

    console.log(body);

    const paymentEventId = req.headers.get("x-razorpay-event-id");
    const paymentOrderId = body.payload.pyament.entity.order_id;

    console.log(paymentEventId);
    console.log(paymentOrderId);

    // validateWebhookSignature(JSON.stringify(webhookBody), webhookSignature, webhookSecret)

    return NextResponse.json({ message: "Payment success" }, { status: 200 });
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