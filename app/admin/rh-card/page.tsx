import Link from "next/link";
import { ChevronLeft, ChevronRight, IdCard, Search } from "lucide-react";
import { getAdminRhCards } from "@/actions/rhCardAdminActions";
import {
  formatCardDate,
  formatProfession,
  getCardStatus,
} from "@/components/id-card/idCardUtils";
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
export const metadata = { title: "Admin - RH Card" };

export default async function RhCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const search =
    typeof params.search === "string" ? params.search.trim().slice(0, 200) : "";
  const status = ["active", "expired", "inactive"].includes(params.status || "")
    ? params.status!
    : "";
  const { cards, total, page, pageCount, limit } = await getAdminRhCards({
    page: Number(params.page || 1),
    search,
    status,
  });
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (status) query.set("status", status);
    query.set("page", String(nextPage));
    return `/admin/rh-card?${query}`;
  };

  return (
    <div className="min-w-0 space-y-6 py-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <IdCard aria-hidden="true" /> RH Card
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          View RH membership cards and their member details, newest first.
        </p>
      </div>
      <form action="/admin/rh-card" className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:max-w-sm">
          <label
            htmlFor="rh-card-search"
            className="mb-2 block text-sm font-medium"
          >
            Search cards
          </label>
          <Input
            id="rh-card-search"
            name="search"
            defaultValue={search}
            placeholder="Name, email, mobile, or member ID"
          />
        </div>
        <div>
          <label
            htmlFor="rh-card-status"
            className="mb-2 block text-sm font-medium"
          >
            Status
          </label>
          <select
            id="rh-card-status"
            name="status"
            defaultValue={status}
            className="h-9 rounded-lg border bg-white px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <Button type="submit" className="h-9">
          <Search aria-hidden="true" /> Search
        </Button>
        {(search || status) && (
          <Button asChild variant="outline" className="h-9">
            <Link href="/admin/rh-card">Clear filters</Link>
          </Button>
        )}
      </form>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member ID</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Profession</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Activated</TableHead>
              <TableHead>Valid until</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-12 text-center text-slate-500"
                >
                  {search || status
                    ? "No RH cards match your filters."
                    : "No RH cards have been created yet."}
                </TableCell>
              </TableRow>
            ) : (
              cards.map((card) => {
                const cardStatus = getCardStatus(card);
                return (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium">
                      {card.memberShipId || `#${card.memberShipNumber}`}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{card.fullName}</p>
                      <p className="text-muted-foreground text-sm">
                        {card.email}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {card.mobileNumber}
                      </p>
                    </TableCell>
                    <TableCell>{formatProfession(card.profession, card.otherProfession)}</TableCell>
                    <TableCell>
                      {card.city}, {card.state}
                    </TableCell>
                    <TableCell>{formatCardDate(card.activationDate)}</TableCell>
                    <TableCell>{formatCardDate(card.validityDate)}</TableCell>
                    <TableCell className="capitalize">
                      {card.membershipPurchaseType}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          cardStatus === "Active" ? "default" : "secondary"
                        }
                      >
                        {cardStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/admin/rh-card/${card.id}`}
                          aria-label={`View RH card details for ${card.fullName}`}
                        >
                          View details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {total === 0
            ? "0 cards"
            : `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total} cards`}
        </p>
        <nav
          aria-label="RH cards pagination"
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
