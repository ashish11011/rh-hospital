import type { CoursePricing } from "@/lib/rhCardDiscount";

export function CoursePrice({
  pricing,
  currency,
  prominent = false,
}: {
  pricing: CoursePricing;
  currency: string;
  prominent?: boolean;
}) {
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-2">
      {pricing.discountPercent > 0 && (
        <p className="text-muted-foreground text-sm">
          <span className="sr-only">Original price: </span>
          <s>{formatPrice(pricing.originalAmount)}</s>
        </p>
      )}
      <p
        className={`text-foreground font-bold tracking-tight ${prominent ? "text-4xl" : "text-2xl"}`}
      >
        {pricing.discountPercent > 0 && (
          <span className="sr-only">Discounted price: </span>
        )}
        {pricing.amount <= 0 ? "Free" : formatPrice(pricing.amount)}
      </p>
      {pricing.discountPercent > 0 && (
        <p className="text-sm font-medium text-green-700">
          {pricing.discountPercent}% RH card discount applied
        </p>
      )}
    </div>
  );
}
