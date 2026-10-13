import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminRhCard } from "@/actions/rhCardAdminActions";
import { CancelRhCardMembershipButton } from "@/components/admin/CancelRhCardMembershipButton";
import { IdCardView } from "@/components/id-card/IdCardView";
import {
  formatCardDate,
  formatProfession,
  getCardStatus,
  QUALIFICATION_OPTIONS,
} from "@/components/id-card/idCardUtils";
import { isRhCardDiscountEligible } from "@/lib/rhCardDiscount";
import { RH_CARD_DISCOUNT_PERCENT } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin - RH Membership Card Details" };

export default async function RhCardDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminRhCard(id);
  if (!result) notFound();
  const { card, payments } = result;
  const status = getCardStatus(card);
  const eligible = isRhCardDiscountEligible({
    ...card,
    activationDate: card.activationDate ? new Date(card.activationDate) : null,
    validityDate: card.validityDate ? new Date(card.validityDate) : null,
  });
  const bloodGroup = card.bloodGroup
    ? `${card.bloodGroup}${card.rhFactor === "positive" ? "+" : card.rhFactor === "negative" ? "−" : ""}`
    : "Not provided";
  const details = [
    ["Full name", card.fullName],
    ["Email", card.email],
    ["Mobile number", card.mobileNumber],
    ["Gender", card.gender],
    ["Date of birth", formatCardDate(card.dateOfBirth)],
    ["Blood group", bloodGroup],
    ["Profession", formatProfession(card.profession, card.otherProfession)],
    [
      "Qualification",
      QUALIFICATION_OPTIONS.find(
        (option) => option.value === card.qualification,
      )?.label || card.qualification,
    ],
    ["Organization", card.organizationName || "Not provided"],
    ["City", card.city],
    ["State", card.state],
    ["Member ID", card.memberShipId || "Not assigned"],
    ["Membership number", String(card.memberShipNumber)],
    ["Membership type", card.memberShipType],
    ["Purchase type", card.membershipPurchaseType],
    ["Card type", card.cardType],
    ["Activation date", formatCardDate(card.activationDate)],
    ["Valid until", formatCardDate(card.validityDate)],
    ["Created on", formatCardDate(card.createdAt)],
    ["Last updated", formatCardDate(card.updatedAt)],
    [
      "Course discount",
      eligible
        ? `${RH_CARD_DISCOUNT_PERCENT}% discount eligible`
        : "Not eligible",
    ],
    ["Referral code", card.referralCode || "Not provided"],
    ["How they heard about RH", card.hearAboutRh || "Not provided"],
    ["Terms accepted", card.termsAccepted ? "Yes" : "No"],
    ["Card record ID", card.id],
    ["User account ID", card.userId],
  ];
  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="min-w-0 space-y-6 py-6">
      <Button asChild variant="outline">
        <Link href="/admin/rh-card">
          <ArrowLeft aria-hidden="true" /> Back to RH Membership Cards
        </Link>
      </Button>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">
          RH Membership Card details · {card.fullName}
        </h1>
        <Badge variant={status === "Active" ? "default" : "secondary"}>
          {status}
        </Badge>
        <CancelRhCardMembershipButton
          cardId={card.id}
          memberName={card.fullName}
          isActive={card.isActive}
        />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section
          aria-label="Card preview"
          className="min-w-0 rounded-xl border p-4 sm:p-6"
        >
          <IdCardView card={card} />
        </section>
        <section className="min-w-0 rounded-xl border p-4 sm:p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Member and membership information
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-muted-foreground text-sm">{label}</dt>
                <dd className="mt-1 font-medium break-words">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <section className="rounded-xl border p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">Payment details</h2>
        {payments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No payment record is linked to this card.
          </p>
        ) : (
          <div className="space-y-4">
            {payments.map((record) => (
              <dl
                key={record.id}
                className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                <div>
                  <dt className="text-muted-foreground text-sm">Order ID</dt>
                  <dd className="mt-1 font-medium break-all">
                    {record.gatewayOrderId}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-sm">
                    Amount / paid
                  </dt>
                  <dd className="mt-1 font-medium">
                    {formatAmount(record.amount, record.currency)} /{" "}
                    {formatAmount(record.amountPaid, record.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-sm">
                    Payment status
                  </dt>
                  <dd className="mt-1 font-medium capitalize">
                    {record.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-sm">
                    Order created on
                  </dt>
                  <dd className="mt-1 font-medium">
                    {formatCardDate(record.createdAt)}
                  </dd>
                </div>
              </dl>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
