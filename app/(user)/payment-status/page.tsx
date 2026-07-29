import { PaymentStatusClient } from "./PaymentStatusClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Status | RH Healthcare",
  description: "Verify your RH Healthcare payment status.",
};

export default function PaymentStatusPage() {
  return <PaymentStatusClient />;
}
