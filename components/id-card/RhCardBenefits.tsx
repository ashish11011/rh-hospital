import type { ReactNode } from "react";
import { BookOpen, CalendarDays, IdCard, Mail } from "lucide-react";
import { RH_CARD_DISCOUNT_PERCENT } from "@/lib/constants";

const BENEFITS = [
  {
    icon: CalendarDays,
    text: `Get ${RH_CARD_DISCOUNT_PERCENT}% discount on workshops.`,
  },
  {
    icon: BookOpen,
    text: `Get ${RH_CARD_DISCOUNT_PERCENT}% discount on RH online courses.`,
  },
  {
    icon: Mail,
    text: "Get an e-newsletter in your email with the latest updates in nursing.",
  },
];

export function RhCardBenefits({ children }: { children?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-teal-50 p-5 sm:p-8">
      <div className="mb-5 flex items-start gap-3">
        <div className="text-primary rounded-xl bg-white p-3">
          <IdCard aria-hidden="true" className="size-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Your RH card benefits
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Save on learning and stay up to date with nursing. Your card is
            valid for one year from activation after successful payment.
          </p>
        </div>
      </div>
      <ul className="grid gap-3 md:grid-cols-3">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex items-start gap-3 rounded-xl border border-green-100 bg-white p-4 text-sm leading-6 text-slate-700"
          >
            <Icon
              aria-hidden="true"
              className="text-primary mt-1 size-5 shrink-0"
            />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}
