import { NextResponse } from "next/server";
import { db } from "@/lib/dbConfig";
import { payment } from "@/db";
import { eq, desc } from "drizzle-orm";
import { extractEmailFromToken } from "@/lib/verify-token";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const email = await extractEmailFromToken(token);

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Fetch purchase history ordered by creation date descending
    const purchaseHistory = await db.select({
      id: payment.id,
      orderType: payment.orderType,
      orderId: payment.orderId,
      currency: payment.currency,
      gatewayPaymentEventId: payment.gatewayPaymentEventId,
      modeOfPayment: payment.modeOfPayment,
      amount: payment.amount,
      transactionDate: payment.transactionDate,
      status: payment.status
    })
      .from(payment)
      .where(eq(payment.email, email.toLowerCase()))
      .orderBy(desc(payment.createdAt));

    return NextResponse.json({ success: true, purchases: purchaseHistory }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch purchase history" }, { status: 500 });
  }
}
