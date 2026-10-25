"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Search } from "lucide-react";
import {
  inspectAdminPayment,
  recoverAdminPayment,
  type PaymentRecoveryDetails,
} from "@/actions/paymentRecoveryActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const purchaseTypes: Record<string, { name: string; fulfillment: string }> = {
  workshop: {
    name: "Workshop",
    fulfillment: "Mark the workshop registration as paid.",
  },
  product: {
    name: "Product / Membership Card",
    fulfillment:
      "Create or restore the paid RH Membership Card using the saved checkout details.",
  },
  course: { name: "Course", fulfillment: "Activate the course enrolment." },
  seminar: {
    name: "Seminar",
    fulfillment:
      "Mark the seminar registration as paid and save its payment reference.",
  },
};

function money(value: number | null, currency: string | null) {
  if (value === null) return "Not provided";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
    }).format(value);
  } catch {
    return `${currency || ""} ${value}`;
  }
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 font-medium break-all">{children}</dd>
    </div>
  );
}

export function PaymentRecoveryForm({
  initialReference = "",
}: {
  initialReference?: string;
}) {
  const [reference, setReference] = useState(initialReference);
  const [details, setDetails] = useState<PaymentRecoveryDetails | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);
  const [finished, setFinished] = useState(false);
  const [pending, startTransition] = useTransition();
  const [operation, setOperation] = useState<"check" | "recover">("check");

  function checkPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOperation("check");
    setMessage(null);
    setDetails(null);
    setFinished(false);
    startTransition(async () => {
      try {
        const result = await inspectAdminPayment(reference);
        setDetails(result.payment || null);
        if (result.message)
          setMessage({ text: result.message, success: result.success });
      } catch {
        setMessage({
          text: "Unable to check the payment. Please try again.",
          success: false,
        });
      }
    });
  }

  function recoverPayment() {
    if (!details || pending) return;
    setOperation("recover");
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await recoverAdminPayment(details.id);
        setDetails(result.payment || null);
        setFinished(result.success);
        setMessage({
          text: result.message || "Unable to recover the payment.",
          success: result.success,
        });
      } catch {
        setDetails(null);
        setMessage({
          text: "Recovery was interrupted. Check the payment again before retrying.",
          success: false,
        });
      }
    });
  }

  return (
    <div className="space-y-6" aria-busy={pending}>
      <Card>
        <CardHeader>
          <CardTitle>Check with HDFC</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={checkPayment}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-2">
              <label
                htmlFor="recovery-reference"
                className="text-sm font-medium"
              >
                HDFC order ID or payment ID
              </label>
              <Input
                id="recovery-reference"
                value={reference}
                maxLength={200}
                required
                disabled={pending}
                placeholder="Enter an ID from Payments"
                onChange={(event) => {
                  setReference(event.target.value);
                  setDetails(null);
                  setMessage(null);
                  setFinished(false);
                }}
              />
            </div>
            <Button type="submit" disabled={pending || !reference.trim()}>
              {pending && operation === "check" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              {pending && operation === "check"
                ? "Checking HDFC…"
                : "Get payment details"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {message && (
        <div
          role={message.success ? "status" : "alert"}
          className={`rounded-xl border p-4 text-sm ${message.success ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"}`}
        >
          {message.text}
        </div>
      )}

      {details && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Saved payment</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <Detail label="Purchase">
                    {purchaseTypes[details.orderType]?.name ||
                      details.orderType}
                  </Detail>
                  <Detail label="Status">
                    <Badge variant="outline">{details.status}</Badge>
                  </Detail>
                  <Detail label="Customer">{details.email || "—"}</Detail>
                  <Detail label="Phone">{details.contact || "—"}</Detail>
                  <Detail label="Amount">
                    {money(details.amount, details.currency)}
                  </Detail>
                  <Detail label="Paid / Due">
                    {money(details.amountPaid, details.currency)} /{" "}
                    {money(details.amountDue, details.currency)}
                  </Detail>
                  <Detail label="Payment ID">{details.id}</Detail>
                  <Detail label="Purchase / Registration ID">
                    {details.orderId}
                  </Detail>
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>HDFC payment details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <Detail label="HDFC status">
                    <Badge variant="outline">{details.gatewayStatus}</Badge>
                  </Detail>
                  <Detail label="Amount">
                    {money(details.gatewayAmount, details.gatewayCurrency)}
                  </Detail>
                  <Detail label="Currency">
                    {details.gatewayCurrency || "Not provided"}
                  </Detail>
                  <Detail label="Payment method">
                    {details.paymentMethod || "Not provided"}
                  </Detail>
                  <Detail label="HDFC order ID">
                    {details.gatewayOrderId}
                  </Detail>
                  <Detail label="Transaction ID">
                    {details.transactionId || "Not provided"}
                  </Detail>
                  <Detail label="Last checked (IST)">
                    {date(details.verifiedAt)}
                  </Detail>
                  <Detail label="Invoice queue">
                    {details.invoiceQueuedAt
                      ? `Queued ${date(details.invoiceQueuedAt)} IST`
                      : "Not queued"}
                  </Detail>
                </dl>
              </CardContent>
            </Card>
          </div>
          {details.blockedReason ? (
            <div
              role="alert"
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              {details.blockedReason}
            </div>
          ) : (
            <Card className="border border-green-200 bg-green-50/50">
              <CardContent className="space-y-4 pt-1">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-green-900">
                    <CheckCircle2 className="size-4" /> HDFC payment verified
                  </p>
                  <p className="mt-2 text-sm text-green-900">
                    {purchaseTypes[details.orderType]?.fulfillment} Complete the
                    payment record, then queue its invoice.
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    HDFC is checked again when you complete the payment. An
                    invoice already queued will not be queued again.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={recoverPayment}
                  disabled={pending || finished}
                >
                  {pending && operation === "recover" && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {finished
                    ? "Recovery completed"
                    : pending && operation === "recover"
                      ? "Completing payment…"
                      : "Complete payment & queue invoice"}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
