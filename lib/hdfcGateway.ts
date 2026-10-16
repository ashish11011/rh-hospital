import "server-only";
import { randomBytes, randomUUID } from "crypto";

const DEFAULT_HDFC_SESSION_URL = "https://smartgateway.hdfcuat.bank.in/session";
const LOCAL_PAYMENT_RETURN_URL = "http://localhost:3000/payment-status";
const PRODUCTION_PAYMENT_RETURN_URL =
  "https://www.rhhealthcaresimulation.com/payment-status";

type HdfcSessionInput = {
  gatewayOrderId: string;
  amount: number;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  description: string;
  returnQuery?: Record<string, string>;
};

export type HdfcSessionResponse = {
  status: string;
  id: string;
  order_id: string;
  payment_links?: {
    web?: string;
    expiry?: string;
  };
  sdk_payload?: unknown;
  order_expiry?: string;
};

export type HdfcOrderStatusResponse = {
  status?: string;
  order_id?: string;
  orderId?: string;
  txn_id?: string;
  txnId?: string;
  id?: string;
  amount?: string | number;
  [key: string]: unknown;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function getHdfcAuthorizationHeader() {
  // Prefer dedicated API credentials; the legacy variable also authenticates webhooks.
  const value =
    process.env.HDFC_API_KEY_BASE64 ||
    process.env.HDFC_SMARTGATEWAY_AUTHORIZATION ||
    process.env.HDFC_AUTHORIZATION;

  if (!value) {
    throw new Error("HDFC authorization is not configured");
  }

  return value.startsWith("Basic ") ? value : `Basic ${value}`;
}

function getHdfcHeaders(customerId?: string) {
  const headers: Record<string, string> = {
    Authorization: getHdfcAuthorizationHeader(),
    "Content-Type": "application/json",
    "x-merchantid": getRequiredEnv("HDFC_SMARTGATEWAY_MERCHANT_ID"),
    "x-customerid":
      customerId || process.env.HDFC_SMARTGATEWAY_HEADER_CUSTOMER_ID || "",
  };

  if (process.env.HDFC_SMARTGATEWAY_RESELLER_ID) {
    headers["x-resellerid"] = process.env.HDFC_SMARTGATEWAY_RESELLER_ID;
  }

  return headers;
}

function sanitizeNamePart(value: string, fallback: string) {
  return value.replace(/[^a-zA-Z0-9().\-_]/g, "").slice(0, 60) || fallback;
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = sanitizeNamePart(parts[0] || "Customer", "Customer");
  const lastName = sanitizeNamePart(parts.slice(1).join("-") || "User", "User");

  return { firstName, lastName };
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

function formatHdfcAmount(amount: number) {
  return Number(amount).toFixed(2);
}

export function createHdfcGatewayOrderId(prefix = "ORD") {
  return `${prefix}${randomUUID().replace(/-/g, "").substring(0, 17).toUpperCase()}`;
}

export function createHdfcCustomerId(userId?: string | null) {
  const cleanUserId = userId?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18);
  return cleanUserId
    ? `C${cleanUserId}`
    : `C${randomBytes(8).toString("hex").toUpperCase()}`;
}

export async function createHdfcPaymentSession(input: HdfcSessionInput) {
  const { firstName, lastName } = splitName(input.customerName);
  const sessionUrl =
    process.env.HDFC_SMARTGATEWAY_SESSION_URL || DEFAULT_HDFC_SESSION_URL;
  const returnUrl =
    process.env.NODE_ENV === "production"
      ? PRODUCTION_PAYMENT_RETURN_URL
      : LOCAL_PAYMENT_RETURN_URL;
  const paymentReturnUrl = new URL(returnUrl);
  for (const [key, value] of Object.entries(input.returnQuery || {})) {
    paymentReturnUrl.searchParams.set(key, value);
  }

  const body = {
    order_id: input.gatewayOrderId,
    amount: formatHdfcAmount(input.amount),
    customer_id: input.customerId,
    customer_email: input.customerEmail,
    customer_phone: normalizePhone(input.customerPhone),
    payment_page_client_id:
      process.env.HDFC_SMARTGATEWAY_PAYMENT_PAGE_CLIENT_ID ||
      process.env.HDFC_SMARTGATEWAY_CLIENT_ID ||
      "hdfcmaster",
    action: "paymentPage",
    currency: "INR",
    return_url: paymentReturnUrl.toString(),
    description: input.description,
    first_name: firstName,
    last_name: lastName,
  };
  const requestHeader = getHdfcHeaders(input.customerId);
  console.log(requestHeader, body);
  const response = await fetch(sessionUrl, {
    method: "POST",
    headers: requestHeader,
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });

  const responseText = await response.text();
  console.log(responseText);
  let data: HdfcSessionResponse & { error?: string; error_message?: string };

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`HDFC session returned non-JSON response: ${responseText}`);
  }

  if (!response.ok || !data.payment_links?.web) {
    throw new Error(
      data.error_message ||
        data.error ||
        "Failed to create HDFC payment session",
    );
  }

  return data;
}

export async function getHdfcOrderStatus(orderId: string, routingId?: string) {
  const configuredUrl = process.env.HDFC_SMARTGATEWAY_ORDER_STATUS_URL;

  if (!configuredUrl) {
    throw new Error("HDFC_SMARTGATEWAY_ORDER_STATUS_URL is not configured");
  }

  const statusUrl = configuredUrl.includes("{order_id}")
    ? configuredUrl.replace("{order_id}", encodeURIComponent(orderId))
    : `${configuredUrl.replace(/\/$/, "")}/${encodeURIComponent(orderId)}`;

  const response = await fetch(statusUrl, {
    method: "GET",
    headers: {
      ...getHdfcHeaders(routingId),
      "x-routing-id": routingId || orderId,
      version: process.env.HDFC_SMARTGATEWAY_STATUS_VERSION || "2023-01-01",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });

  const responseText = await response.text();
  let data: HdfcOrderStatusResponse;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`HDFC status returned non-JSON response: ${responseText}`);
  }

  if (!response.ok) {
    throw new Error(
      String(
        data.error_message || data.error || "Failed to fetch HDFC order status",
      ),
    );
  }

  return data;
}

export function normalizeHdfcOrderStatus(status?: string | null) {
  const value = status?.toUpperCase();

  if (!value) return "pending";

  if (
    [
      "CHARGED",
      "PAID",
      "SUCCESS",
      "SUCCESSFUL",
      "COMPLETED",
      "CAPTURED",
    ].includes(value)
  ) {
    return "completed";
  }

  if (
    [
      "FAILED",
      "FAILURE",
      "AUTHORIZATION_FAILED",
      "JUSPAY_DECLINED",
      "DECLINED",
      "VOIDED",
    ].includes(value)
  ) {
    return "failed";
  }

  if (["CANCELLED", "CANCELED"].includes(value)) {
    return "cancelled";
  }

  return "pending";
}

export function getHdfcTransactionId(data: HdfcOrderStatusResponse) {
  return String(data.txn_id || data.txnId || data.id || "");
}
