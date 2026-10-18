import { NextRequest, NextResponse } from "next/server";
import {
  HdfcPaymentEventName,
  normalizeHdfcWebhookEvent,
  updatePaymentFromGatewayStatus,
} from "@/lib/paymentConfirmation";

type HdfcWebhookOrder = {
  order_id?: string;
  orderId?: string;
  status?: string;
  txn_id?: string;
  txnId?: string;
  id?: string;
  txn_detail?: {
    txn_id?: string;
    txnId?: string;
    status?: string;
  };
  [key: string]: unknown;
};

type HdfcWebhookPayload = HdfcWebhookOrder & {
  event_name?: string;
  content?: {
    order?: HdfcWebhookOrder;
  };
};

function getWebhookOrder(body: HdfcWebhookPayload): HdfcWebhookOrder {
  return body.content?.order || body;
}

function getWebhookTransactionId(order: HdfcWebhookOrder) {
  return String(
    order.txn_id ||
      order.txnId ||
      order.txn_detail?.txn_id ||
      order.txn_detail?.txnId ||
      order.id ||
      "",
  );
}

function isHdfcPaymentEventName(
  eventName?: string,
): eventName is HdfcPaymentEventName {
  return (
    eventName === "ORDER_FAILED" ||
    eventName === "ORDER_SUCCEEDED" ||
    eventName === "ORDER_REFUNDED" ||
    eventName === "ORDER_REFUND_FAILED"
  );
}

export async function POST(req: NextRequest) {
  const merchantCreds = process.env.HDFC_SMARTGATEWAY_AUTHORIZATION;
  console.log("merchantCreds: ", merchantCreds);
  const authorization = req.headers.get("authorization");
  console.log("authorization: ", authorization);

  if (!merchantCreds || !authorization || authorization !== merchantCreds) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = (await req.json()) as HdfcWebhookPayload;
  const order = getWebhookOrder(body);
  console.log("order: ", order);
  const orderId = order.order_id || order.orderId;
  const gatewayStatus = order.status || order.txn_detail?.status;
  const eventName = body.event_name;

  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "Order ID is required" },
      { status: 400 },
    );
  }

  if (!isHdfcPaymentEventName(eventName)) {
    return NextResponse.json(
      { success: false, message: "Unsupported payment event" },
      { status: 400 },
    );
  }
  console.log("HDFC Webhook received:", {
    orderId,
    eventName: body.event_name,
    order,
  });

  try {
    const normalizedStatus = normalizeHdfcWebhookEvent(eventName);

    await updatePaymentFromGatewayStatus({
      gatewayOrderId: String(orderId),
      gatewayEventName: eventName,
      gatewayStatus: gatewayStatus || body.event_name || "UNKNOWN",
      normalizedStatus,
      gatewayPaymentId: getWebhookTransactionId(order),
      responseObject: body,
    });

    return NextResponse.json(
      {
        success: true,
        received: true,
      },
      { status: 200 },
    );
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
