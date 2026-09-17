import { NextRequest, NextResponse } from "next/server";
import { payment } from "@/db";
import { db } from "@/lib/dbConfig";
import { getHdfcOrderStatus, normalizeHdfcOrderStatus } from "@/lib/hdfcGateway";
import { eq } from "drizzle-orm";

function getGatewayAmount(data: Record<string, unknown>) {
  const txnDetail = data.txn_detail as Record<string, unknown> | undefined;
  const value =
    data.effective_amount ||
    data.amount ||
    txnDetail?.txn_amount ||
    txnDetail?.net_amount;

  if (value === undefined || value === null || value === "") return null;

  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const orderId = body.orderId || body.order_id;

  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "Order ID is required" },
      { status: 400 },
    );
  }

  try {
    const [paymentRecord] = await db
      .select()
      .from(payment)
      .where(eq(payment.gatewayOrderId, String(orderId)))
      .limit(1);

    if (!paymentRecord) {
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 },
      );
    }

    const hdfcStatus = await getHdfcOrderStatus(String(orderId));
    const normalizedStatus = normalizeHdfcOrderStatus(hdfcStatus.status);
    const gatewayAmount = getGatewayAmount(hdfcStatus);

    if (
      normalizedStatus === "completed" &&
      gatewayAmount !== null &&
      gatewayAmount !== paymentRecord.amount
    ) {
      return NextResponse.json(
        { success: false, message: "Payment amount mismatch" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: normalizedStatus === "completed",
        status: hdfcStatus.status,
        normalizedStatus,
        orderType: paymentRecord.orderType,
        orderId: paymentRecord.gatewayOrderId,
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("HDFC payment status display error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch payment status",
      },
      { status: 500 },
    );
  }
}
