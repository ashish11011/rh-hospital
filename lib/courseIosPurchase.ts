import { z } from "zod";

// Prices use the course's currency and decimal currency units, independently of website price.
export function normalizeCourseIosPurchase(input: {
  iosPrice?: number | null;
  iosProductId?: string | null;
}) {
  const productId =
    z
      .string()
      .trim()
      .max(255)
      .regex(/^[A-Za-z0-9._-]*$/, "Use the exact App Store product ID.")
      .parse(input.iosProductId ?? "") || null;
  const price =
    input.iosPrice == null
      ? null
      : z
          .number()
          .finite()
          .positive()
          .max(99_999_999.99)
          .refine(
            (value) =>
              Math.abs(value * 100 - Math.round(value * 100)) < 0.00001,
            "iOS price can have up to two decimal places.",
          )
          .parse(input.iosPrice);
  if ((productId === null) !== (price === null))
    throw new Error(
      "Enter both the iOS price and App Store product ID, or leave both empty.",
    );
  return {
    iosProductId: productId,
    iosPrice: price === null ? null : price.toFixed(2),
  };
}
