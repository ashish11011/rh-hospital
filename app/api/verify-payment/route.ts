import { withApiLogging } from "@/lib/logging/api";
import { createLogger } from "@/lib/logging/logger";
import { NextRequest, NextResponse } from "next/server";
import {
  HdfcPaymentEventName,
  normalizeHdfcWebhookEvent,
  updatePaymentFromGatewayStatus,
} from "@/lib/paymentConfirmation";

const logger = createLogger("api", "app/api/verify-payment/route.ts");

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

export const POST = withApiLogging(
  "/app/api/verify-payment",
  async function POST(req: NextRequest) {
    const merchantCreds = process.env.HDFC_SMARTGATEWAY_AUTHORIZATION;
    const authorization = req.headers.get("authorization");

    if (!merchantCreds || !authorization || authorization !== merchantCreds) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await req.json()) as HdfcWebhookPayload;
    // The event ID is available after authentication and parsing; do not log the payload.
    logger.info("Request started", {
      hdfcWebhookId:
        typeof body?.id === "string" ? body.id.slice(0, 256) : undefined,
    });
    const order = getWebhookOrder(body);

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
    logger.diagnostic("HDFC webhook received", {
      orderId,
      gatewayStatus,
      eventName,
    });

    try {
      const normalizedStatus = normalizeHdfcWebhookEvent(eventName);
      logger.diagnostic("HDFC webhook status normalized", {
        orderId,
        normalizedStatus,
      });

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
      logger.error("HDFC webhook processing error:", { details: [error] });
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
  },
  { logStart: false },
);
