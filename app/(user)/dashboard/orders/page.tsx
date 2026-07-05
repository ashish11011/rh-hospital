import { getUserOrders } from "../action";
import { Badge } from "@/components/ui/badge";
import { CreditCard, IndianRupee } from "lucide-react";

export default async function OrdersPage() {
  const orders = await getUserOrders();

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
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
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
                    <td className="px-6 py-4 font-medium text-slate-900 font-mono text-xs">
                      {order.gatewayOrderId || order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {order.orderType}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                        {/* Assuming amount is in paise/cents, adjust if it's already full units */}
                        {order.amount / 100}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={order.status === 'completed' ? 'default' : 'secondary'}
                        className={order.status === 'completed' ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 capitalize" : "capitalize"}
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
