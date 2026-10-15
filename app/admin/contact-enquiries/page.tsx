import Link from "next/link";
import { count, desc, sql } from "drizzle-orm";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MessageSquare,
} from "lucide-react";
import { contact } from "@/db";
import { db } from "@/lib/dbConfig";
import { requireAdmin } from "@/lib/adminAuth";
import { Button } from "@/components/ui/button";
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
export const metadata = { title: "Admin - Contact Enquiries" };

const PAGE_SIZE = 20;
const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export default async function ContactEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  await requireAdmin("contacts");
  const params = await searchParams;
  const requestedPage =
    typeof params.page === "string" ? Number(params.page) : 1;
  const [{ total }] = await db.select({ total: count() }).from(contact);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(
    pageCount,
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1,
  );
  const offset = (page - 1) * PAGE_SIZE;
  const enquiries = await db
    .select()
    .from(contact)
    .orderBy(sql`${contact.createdAt} desc nulls last`, desc(contact.id))
    .limit(PAGE_SIZE)
    .offset(offset);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Contact enquiries
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            All contact form submissions, newest first.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/api/admin/contact-enquiries/export" download>
            <Download aria-hidden="true" /> Export all ({total}) · CSV
          </a>
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Received (IST)</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact details</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="pr-4">Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <MessageSquare
                    className="text-muted-foreground mx-auto mb-3 size-8"
                    aria-hidden="true"
                  />
                  <p className="font-medium">No enquiries yet</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    New contact form submissions will appear here.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              enquiries.map((enquiry) => (
                <TableRow key={enquiry.id} className="align-top">
                  <TableCell className="text-muted-foreground py-4 pl-4">
                    {enquiry.createdAt ? (
                      <time dateTime={enquiry.createdAt.toISOString()}>
                        {dateFormat.format(enquiry.createdAt)}
                      </time>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="max-w-56 min-w-36 py-4 font-medium break-words whitespace-normal">
                    {enquiry.name}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <p className="max-w-64 break-words whitespace-normal">
                        {enquiry.email || "No email provided"}
                      </p>
                      <p className="text-muted-foreground">
                        {enquiry.mobileNumber || "No mobile provided"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xl min-w-64 py-4 leading-6 break-words whitespace-pre-wrap">
                    {enquiry.message || "—"}
                  </TableCell>
                  <TableCell className="py-4 pr-4">
                     <p className="max-w-64 break-words whitespace-normal text-muted-foreground">
                       {enquiry.formSource || "Not specified"}
                     </p>
                   </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {total === 0
            ? "0 enquiries"
            : `Showing ${offset + 1}–${Math.min(offset + PAGE_SIZE, total)} of ${total} enquiries`}
        </p>
        <nav
          aria-label="Enquiries pagination"
          className="flex items-center gap-3"
        >
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={`?page=${page - 1}`}>
                <ChevronLeft aria-hidden="true" /> Previous
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              <ChevronLeft aria-hidden="true" /> Previous
            </Button>
          )}
          <span className="text-muted-foreground text-sm">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Button asChild variant="outline">
              <Link href={`?page=${page + 1}`}>
                Next <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Next <ChevronRight aria-hidden="true" />
            </Button>
          )}
        </nav>
      </div>
    </div>
  );
}
