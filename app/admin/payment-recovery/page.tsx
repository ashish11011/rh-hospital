import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { requireAdmin } from "@/lib/adminAuth";
import { PaymentRecoveryForm } from "@/components/admin/PaymentRecoveryForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin - Payment Recovery" };

export default async function PaymentRecoveryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("full");
  const params = await searchParams;
  const orderId =
    typeof params.orderId === "string" ? params.orderId.slice(0, 200) : "";

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <RefreshCw aria-hidden="true" className="size-6" /> Payment Recovery
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Recover a payment that succeeded at HDFC but was not confirmed here.
          Check the payment, then complete its purchase and queue the invoice.
        </p>
        <Link
          href="/admin/payments"
          className="mt-3 inline-block text-sm font-medium text-green-700 underline underline-offset-4"
        >
          Find a payment in Payments
        </Link>
      </div>
      <PaymentRecoveryForm initialReference={orderId} />
    </div>
  );
}
