"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IdCardForm } from "./IdCardForm";
import { IdCardView } from "./IdCardView";
import { RhCardBenefits } from "./RhCardBenefits";
import type { IdCardApiResponse, UserCardRecord } from "./types";
import { Skeleton } from "../ui/skeleton";

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

  useEffect(() => {
    if (!result?.pendingPurchase || result.card || editPending || error) return;
    // Read saved card data while the webhook processes the purchase.
    const refresh = () => {
      if (document.visibilityState === "visible")
        setAttempt((current) => current + 1);
    };
    const timeout = setTimeout(refresh, 10000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [result, editPending, error]);

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
      {allowCreate && (
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
      )}
      {/* {allowCreate && (
        <RhCardBenefits
          pricing={result?.purchase}
          showPurchase={!result?.card}
        />
      )} */}
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
        <Skeleton className="bg-primary/10 border-primary h-96 w-60 animate-pulse" />
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
        </div>
      ) : result.pendingPurchase && !editPending ? (
        <div className="space-y-4 rounded-xl bg-slate-50 p-5">
          <p className="font-semibold text-slate-900">
            {result.pendingPurchase.status === "completed"
              ? "Your RH Membership Card payment is confirmed"
              : "Your RH Membership Card payment is pending"}
          </p>
          <p className="text-sm text-slate-600">
            {result.pendingPurchase.status === "completed"
              ? "Your payment is confirmed. Your card will appear here when it is available. If it remains unavailable, please contact support; you do not need to pay again."
              : "Your card will appear here after payment confirmation. If you have already paid, please wait for confirmation and do not pay again."}
          </p>
          <div className="flex flex-wrap gap-3">
            {result.pendingPurchase.paymentUrl && (
              <Button onClick={resumePayment}>Continue payment</Button>
            )}
            {result.pendingPurchase.status !== "completed" &&
              (allowCreate ? (
                <Button variant="ghost" onClick={() => setEditPending(true)}>
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
      {/* {!allowCreate && (
        <Link
          href="/dashboard/id-card#membership-benefits"
          className="text-primary inline-block text-sm font-medium underline underline-offset-4"
        >
          View RH Membership Card benefits
        </Link>
      )} */}
    </section>
  );
}
