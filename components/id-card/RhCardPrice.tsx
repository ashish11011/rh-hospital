import {
  RH_ID_CARD_AMOUNT_INR,
  RH_ID_CARD_LIST_AMOUNT_INR,
} from "@/lib/constants";

export function RhCardPrice({
  amount = RH_ID_CARD_AMOUNT_INR,
  currency = "INR",
}: {
  amount?: number;
  currency?: string;
}) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="flex flex-wrap items-baseline gap-3">
      {amount < RH_ID_CARD_LIST_AMOUNT_INR && (
        <p className="text-base text-slate-500">
          <span className="sr-only">Original price: </span>
          <s>{formatPrice(RH_ID_CARD_LIST_AMOUNT_INR)}</s>
        </p>
      )}
      <p className="text-2xl font-bold text-slate-900">
        <span className="sr-only">Purchase price: </span>
        {formatPrice(amount)}
      </p>
    </div>
  );
}
