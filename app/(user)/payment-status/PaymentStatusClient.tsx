"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

type StatusState = "checking" | "completed" | "pending" | "failed" | "error" | "missing";

type StoredPaymentOrder = {
  orderId?: string;
  type?: string;
};

type PaymentDetails = {
  orderId: string;
  amount: number;
  currency: string;
};

export function PaymentStatusClient() {
  const [status, setStatus] = useState<StatusState>("checking");
  const [message, setMessage] = useState("Checking your payment status...");
  const [orderId, setOrderId] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null,
  );

  function formatAmount(amount: number, currency: string) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  }

  async function checkPaymentStatus(currentOrderId = orderId) {
    if (!currentOrderId) {
      setStatus("missing");
      setMessage("We could not find your payment order in this browser session.");
      return;
    }

    setStatus("checking");
    setMessage("Checking your payment status...");

    try {
      const response = await fetch("/api/payment-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: currentOrderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to verify payment right now.");
      }

      if (data.orderId && typeof data.amount === "number") {
        setPaymentDetails({
          orderId: data.orderId,
          amount: data.amount,
          currency: data.currency || "INR",
        });
      }

      if (data.normalizedStatus === "completed") {
        setStatus("completed");
        setMessage("Your payment has been confirmed successfully.");
        window.sessionStorage.removeItem("hdfcPaymentOrder");
        return;
      }

      if (data.normalizedStatus === "failed" || data.normalizedStatus === "cancelled") {
        setStatus("failed");
        setMessage("Payment could not be completed. If money was deducted, please contact support.");
        return;
      }

      setStatus("pending");
      setMessage("Your payment is still being verified. Please retry in a few seconds.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to verify payment right now.");
    }
  }

  useEffect(() => {
    const storedOrder = window.sessionStorage.getItem("hdfcPaymentOrder");

    if (!storedOrder) {
      setStatus("missing");
      setMessage("We could not find your payment order in this browser session.");
      return;
    }

    try {
      const parsedOrder = JSON.parse(storedOrder) as StoredPaymentOrder;

      if (!parsedOrder.orderId) {
        throw new Error("Missing order ID");
      }

      setOrderId(parsedOrder.orderId);
      checkPaymentStatus(parsedOrder.orderId);
    } catch {
      setStatus("missing");
      setMessage("We could not read your payment order. Please contact support if money was deducted.");
    }
  }, []);

  const Icon =
    status === "completed" ? CheckCircle2 : status === "checking" || status === "pending" ? Clock : AlertCircle;

  const iconClassName =
    status === "completed"
      ? "text-green-600"
      : status === "checking" || status === "pending"
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="flex w-full items-center justify-center py-20">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-5 rounded-full bg-slate-100 p-4">
            <Icon className={`h-14 w-14 ${iconClassName}`} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            {status === "completed"
              ? "Registration Successful"
              : status === "checking"
                ? "Verifying Payment"
                : "Payment Status"}
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">{message}</p>

          {paymentDetails && (
            <div className="mt-6 w-full rounded-xl border bg-slate-50 p-4 text-left">
              <div className="flex items-center justify-between gap-4 border-b pb-3 text-sm">
                <span className="text-muted-foreground">Order number</span>
                <span className="font-medium">{paymentDetails.orderId}</span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-3 text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {formatAmount(paymentDetails.amount, paymentDetails.currency)}
                </span>
              </div>
            </div>
          )}

          {(status === "pending" || status === "error") && (
            <Button className="mt-6" onClick={() => checkPaymentStatus()}>
              Retry verification
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
