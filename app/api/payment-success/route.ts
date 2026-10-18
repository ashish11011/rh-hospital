import { NextRequest, NextResponse } from "next/server";
import {
  getHdfcTransactionId,
  normalizeHdfcOrderStatus,
  type HdfcOrderStatusResponse,
} from "@/lib/hdfcGateway";
import { updatePaymentFromGatewayStatus } from "@/lib/paymentConfirmation";

export async function POST(req: NextRequest) {
  const expectedAuthorization =
    process.env.HDFC_SMARTGATEWAY_WEBHOOK_AUTHORIZATION;

  if (expectedAuthorization) {
    const authorization = req.headers.get("authorization");

    if (authorization !== expectedAuthorization) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  const body = (await req.json()) as HdfcOrderStatusResponse;
  const orderId = body.order_id || body.orderId;
  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "Order ID is required" },
      { status: 400 },
    );
  }

  try {
    const normalizedStatus = normalizeHdfcOrderStatus(body.status);
    await updatePaymentFromGatewayStatus({
      gatewayOrderId: String(orderId),
      gatewayStatus: body.status || "UNKNOWN",
      normalizedStatus,
      gatewayPaymentId: getHdfcTransactionId(body),
      responseObject: body,
    });

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("HDFC webhook processing error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process payment webhook",
      },
      { status: 500 },
    );
  }
}
