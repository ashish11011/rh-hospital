import Link from "next/link";
import { ChevronLeft, ChevronRight, CreditCard, Search } from "lucide-react";
import { getAdminPayments } from "@/actions/paymentAdminActions";
import { requireAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin - Payments" };

const orderTypes = {
  workshop: "Workshop",
  product: "Product / Membership Card",
  course: "Course",
  seminar: "Seminar",
};

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
}

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }).format(new Date(value))
    : "—";
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("full");
  const params = await searchParams;
  const search =
    typeof params.search === "string" ? params.search.trim().slice(0, 200) : "";
  const status =
    typeof params.status === "string" ? params.status.trim().slice(0, 80) : "";
  const orderType =
    typeof params.orderType === "string" &&
    Object.hasOwn(orderTypes, params.orderType)
      ? params.orderType
      : "";
  const result = await getAdminPayments({
    page: typeof params.page === "string" ? Number(params.page) : 1,
    search,
    status,
    orderType,
  });
  const { payments, total, page, pageCount, limit } = result;
  const filtered = Boolean(search || status || orderType);
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (status) query.set("status", status);
    if (orderType) query.set("orderType", orderType);
    query.set("page", String(nextPage));
    return `/admin/payments?${query}`;
  };

  return (
    <div className="min-w-0 space-y-6 py-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <CreditCard aria-hidden="true" /> Payments
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          View payment records across workshops, courses, seminars, and
          membership cards, newest first.
        </p>
      </div>
      <form action="/admin/payments" className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:max-w-sm">
          <label
            htmlFor="payment-search"
            className="mb-2 block text-sm font-medium"
          >
            Search payments
          </label>
          <Input
            id="payment-search"
            name="search"
            defaultValue={search}
            placeholder="Email, phone, order, payment, or transaction ID"
            maxLength={200}
          />
        </div>
        <div>
          <label
            htmlFor="payment-status"
            className="mb-2 block text-sm font-medium"
          >
            Status
          </label>
          <Input
            id="payment-status"
            name="status"
            defaultValue={status}
            list="payment-statuses"
            placeholder="All statuses"
            maxLength={80}
            className="sm:w-44"
          />
          <datalist id="payment-statuses">
            {[
              "pending",
              "processing",
              "completed",
              "failed",
              "cancelled",
              "refunded",
              "refund_failed",
              "NEW",
              "CHARGED",
            ].map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
        </div>
        <div>
          <label
            htmlFor="payment-type"
            className="mb-2 block text-sm font-medium"
          >
            Payment for
          </label>
          <select
            id="payment-type"
            name="orderType"
            defaultValue={orderType}
            className="h-9 rounded-lg border bg-white px-3 text-sm"
          >
            <option value="">All types</option>
            {Object.entries(orderTypes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="h-9">
          <Search aria-hidden="true" /> Search
        </Button>
        {filtered && (
          <Button asChild variant="outline" className="h-9">
            <Link href="/admin/payments">Clear filters</Link>
          </Button>
        )}
      </form>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment / Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>Created (IST)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-slate-500"
                >
                  {filtered
                    ? "No payments match your filters."
                    : "No payment records yet."}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="max-w-sm whitespace-normal!">
                    <p className="font-medium">
                      {orderTypes[record.orderType]}
                    </p>
                    <p className="mt-1 font-mono text-xs break-all">
                      {record.gatewayOrderId}
                    </p>
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer text-slate-600">
                        Record IDs
                      </summary>
                      <dl className="mt-2 space-y-1 break-all">
                        <div>
                          <dt className="font-medium">Payment ID</dt>
                          <dd>{record.id}</dd>
                        </div>
                        <div>
                          <dt className="font-medium">
                            Order / Registration ID
                          </dt>
                          <dd>{record.orderId}</dd>
                        </div>
                        {record.gatewayPaymentId && (
                          <div>
                            <dt className="font-medium">Gateway payment ID</dt>
                            <dd>{record.gatewayPaymentId}</dd>
                          </div>
                        )}
                        {record.gatewayInvoiceId && (
                          <div>
                            <dt className="font-medium">Gateway invoice ID</dt>
                            <dd>{record.gatewayInvoiceId}</dd>
                          </div>
                        )}
                      </dl>
                    </details>
                  </TableCell>
                  <TableCell>
                    <p>{record.email || "—"}</p>
                    <p className="text-muted-foreground text-xs">
                      {record.contact || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(record.amount, record.currency)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(record.amountPaid, record.currency)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(record.amountDue, record.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-56 font-mono text-xs break-all whitespace-normal!">
                      {record.transactionId || record.gatewayPaymentId || "—"}
                    </p>
                    {record.modeOfPayment && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {record.modeOfPayment}
                      </p>
                    )}
                    {record.transactionId && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatDate(record.transactionDate)} IST
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(record.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {total === 0
            ? "0 payments"
            : `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total} payments`}
        </p>
        <nav
          aria-label="Payments pagination"
          className="flex items-center gap-3"
        >
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={pageHref(page - 1)}>
                <ChevronLeft aria-hidden="true" /> Previous
              </Link>
            </Button>
          ) : (
            <Button disabled variant="outline">
              <ChevronLeft aria-hidden="true" /> Previous
            </Button>
          )}
          <span className="text-sm">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Button asChild variant="outline">
              <Link href={pageHref(page + 1)}>
                Next <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <Button disabled variant="outline">
              Next <ChevronRight aria-hidden="true" />
            </Button>
          )}
        </nav>
      </div>
    </div>
  );
}
