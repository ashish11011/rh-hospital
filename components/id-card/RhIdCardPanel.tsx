"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IdCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IdCardForm } from "./IdCardForm";
import { IdCardView } from "./IdCardView";
import { RhCardBenefits } from "./RhCardBenefits";
import type { IdCardApiResponse, UserCardRecord } from "./types";

export function RhIdCardPanel({
  allowCreate = false,
}: {
  allowCreate?: boolean;
}) {
  const router = useRouter();
  const [result, setResult] = useState<IdCardApiResponse | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [created, setCreated] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [editPending, setEditPending] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 30000);
    async function load() {
      try {
        const response = await fetch("/api/auth/mobile/id-card", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data: IdCardApiResponse = await response.json();
        if (!response.ok || !data.success)
          throw new Error(
            data.error || "Unable to load your RH Membership Card.",
          );
        if (active) setResult(data);
      } catch (cause) {
        if (active)
          setError(
            controller.signal.aborted
              ? "Loading your card took too long. Please try again."
              : cause instanceof Error
                ? cause.message
                : "Unable to load your RH Membership Card.",
          );
      } finally {
        clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  function onGenerated(card: UserCardRecord) {
    setResult({ success: true, card });
    setCreated(true);
    router.refresh();
  }

  async function verifyPayment() {
    if (!result?.pendingPurchase) return;
    setVerifying(true);
    setPaymentMessage("");
    try {
      const response = await fetch("/api/payment-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: result.pendingPurchase.orderId }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message || "Unable to verify payment. Please try again.",
        );
      setPaymentMessage(
        data.normalizedStatus === "completed"
          ? "Your payment is confirmed. Loading your card…"
          : ["failed", "cancelled"].includes(data.normalizedStatus)
            ? "Payment was not completed. You can try again."
            : "Your payment is still pending. Please complete it or verify again shortly.",
      );
      setAttempt((current) => current + 1);
      if (data.normalizedStatus === "completed") router.refresh();
    } catch (cause) {
      setPaymentMessage(
        cause instanceof Error ? cause.message : "Unable to verify payment.",
      );
    } finally {
      setVerifying(false);
    }
  }

  function resumePayment() {
    const purchase = result?.pendingPurchase;
    if (!purchase?.paymentUrl) return;
    window.sessionStorage.setItem(
      "hdfcPaymentOrder",
      JSON.stringify({ orderId: purchase.orderId, type: "rh_id_card" }),
    );
    window.location.assign(purchase.paymentUrl);
  }

  return (
    <section
      aria-labelledby="rh-card-title"
      className={allowCreate ? "space-y-6" : "min-w-0 space-y-5"}
    >
      <div>
        <h2
          id="rh-card-title"
          className="flex items-center gap-2 text-xl font-semibold text-slate-900"
        >
          <IdCard className="text-primary size-5" />
          Your RH Membership Card
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Your RH Healthcare Membership, available on the website and mobile
          app.
        </p>
      </div>
      {allowCreate && (
        <RhCardBenefits
          pricing={result?.purchase}
          showPurchase={!result?.card}
        />
      )}
      {error ? (
        <div
          role="alert"
          className="space-y-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>
          <Button
            variant="outline"
            onClick={() => {
              setError("");
              setResult(null);
              setAttempt((current) => current + 1);
            }}
          >
            Try again
          </Button>
        </div>
      ) : !result ? (
        <div
          role="status"
          className="flex min-h-32 items-center justify-center gap-2 rounded-xl bg-slate-50 text-sm text-slate-500"
        >
          <Loader2 className="size-5 animate-spin" />
          Loading your RH Membership Card…
        </div>
      ) : result.card ? (
        <div className="space-y-4">
          {created && (
            <p
              role="status"
              className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              Your RH Membership Card has been created. You can also find it on
              your dashboard.
            </p>
          )}
          <IdCardView card={result.card} />
          {allowCreate && (
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          )}
        </div>
      ) : result.pendingPurchase && !editPending ? (
        <div className="space-y-4 rounded-xl bg-slate-50 p-5">
          <p className="font-semibold text-slate-900">
            {result.pendingPurchase.status === "completed"
              ? "Your RH Membership Card payment is confirmed"
              : "Your RH Membership Card payment is pending"}
          </p>
          <p className="text-sm text-slate-600">
            Your card will be created after payment confirmation. If you have
            already paid, verify your payment before starting another checkout.
          </p>
          {paymentMessage && (
            <p role="status" className="text-sm text-slate-700">
              {paymentMessage}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {result.pendingPurchase.paymentUrl && (
              <Button onClick={resumePayment} disabled={verifying}>
                Continue payment
              </Button>
            )}
            <Button
              variant="outline"
              onClick={verifyPayment}
              disabled={verifying}
            >
              {verifying && <Loader2 className="size-4 animate-spin" />}Verify
              payment
            </Button>
            {result.pendingPurchase.status !== "completed" &&
              (allowCreate ? (
                <Button
                  variant="ghost"
                  disabled={verifying}
                  onClick={() => setEditPending(true)}
                >
                  Edit details or retry
                </Button>
              ) : (
                <Button asChild variant="ghost">
                  <Link href="/dashboard/id-card">Review details</Link>
                </Button>
              ))}
          </div>
        </div>
      ) : allowCreate ? (
        <IdCardForm
          defaults={result.defaults || {}}
          onGenerated={onGenerated}
          pricing={result.purchase}
        />
      ) : (
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-teal-50 p-5">
          <p className="font-semibold text-slate-900">
            You can create your RH Membership Card
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Fill in your details, upload a passport photo, and complete payment
            to get your RH Membership Card.
          </p>
          <Button asChild className="mt-4 h-11 px-5">
            <Link href="/dashboard/id-card">Create RH Membership Card</Link>
          </Button>
        </div>
      )}
      {!allowCreate && (
        <Link
          href="/dashboard/id-card#membership-benefits"
          className="text-primary inline-block text-sm font-medium underline underline-offset-4"
        >
          View RH Membership Card benefits
        </Link>
      )}
    </section>
  );
}
