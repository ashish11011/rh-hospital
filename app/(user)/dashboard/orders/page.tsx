import { Badge } from "@/components/ui/badge";
import { fetchMobileApi } from "@/lib/serverMobileApi";
import { CreditCard, IndianRupee } from "lucide-react";

type PurchasesApiResponse = {
  success: boolean;
  purchases: {
    id: string;
    orderType: string;
    orderId: string;
    currency: string;
    gatewayPaymentEventId: string | null;
    modeOfPayment: string | null;
    amount: number;
    transactionDate: string | Date | null;
    status: string;
    createdAt: string | Date | null;
    gatewayOrderId: string | null;
  }[];
};

export default async function OrdersPage() {
  const { purchases: orders } = await fetchMobileApi<PurchasesApiResponse>("/api/auth/mobile/purchases");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Orders and Payments
        </h1>
        <p className="mt-1 text-slate-500">
          View your past transactions, invoices, and purchase history.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
          <CreditCard className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-slate-500">You haven't made any purchases yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs font-medium text-slate-900">
                      {order.gatewayOrderId || order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 capitalize">{order.orderType}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center">
                        <IndianRupee className="mr-0.5 h-3.5 w-3.5" />
                        {order.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          order.status === "completed" ? "default" : "secondary"
                        }
                        className={
                          order.status === "captured"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 capitalize hover:bg-emerald-50"
                            : "capitalize"
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
