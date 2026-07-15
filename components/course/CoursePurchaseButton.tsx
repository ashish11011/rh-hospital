"use client";

import { Button } from "@/components/ui/button";
import { Loader2, LockKeyhole, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type CoursePurchaseButtonProps = {
  courseId: string;
  coursePath: string;
  courseTitle: string;
  amount: number;
  currency: string;
  isLoggedIn: boolean;
  isEnrolled: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
    contact?: string | null;
  };
};

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CoursePurchaseButton({
  courseId,
  coursePath,
  courseTitle,
  amount,
  currency,
  isLoggedIn,
  isEnrolled,
  user,
}: CoursePurchaseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startPurchase() {
    if (!isLoggedIn) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(coursePath)}`);
      return;
    }

    if (isEnrolled) {
      router.push("/dashboard/courses");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/course/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const payload = await response.json();

      if (response.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (!response.ok) {
        throw new Error(payload.message || "Unable to start course purchase");
      }

      if (payload.freeEnrollment) {
        toast.success("Course enrolled successfully");
        router.push("/payment-success");
        return;
      }

      const order = payload.data;
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Please refresh and try again.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || currency,
        name: user?.name || "RH Healthcare",
        description: `Purchase for ${courseTitle}`,
        order_id: order.id,
        handler: async function (razorpayResponse: any) {
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(razorpayResponse),
          });

          const verifyPayload = await verifyResponse.json();
          if (verifyPayload.success) {
            toast.success("Payment successful. Your course is being activated.");
            router.push("/payment-success");
          } else {
            toast.error("Payment failed");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.contact || "",
        },
        theme: { color: "#2e7d32" },
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", function () {
        toast.error("Payment failed");
      });
      checkout.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start course purchase");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button className="w-full text-base" size="lg" onClick={startPurchase} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isLoggedIn ? (
        <ShoppingCart className="mr-2 h-4 w-4" />
      ) : (
        <LockKeyhole className="mr-2 h-4 w-4" />
      )}
      {isEnrolled ? "Go to course" : isLoggedIn ? (amount > 0 ? `Pay ${currency} ${amount}` : "Enroll free") : "Sign in to purchase"}
    </Button>
  );
}
