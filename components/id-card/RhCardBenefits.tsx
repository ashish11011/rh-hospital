import type { ReactNode } from "react";
import { BookOpen, CalendarDays, IdCard, Mail, Play } from "lucide-react";
import { RH_CARD_DISCOUNT_PERCENT } from "@/lib/constants";
import { RhCardPrice } from "./RhCardPrice";
import Image from "next/image";

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
    text: "Get an E-newsletter in your email with the latest updates in nursing.",
  },
  {
    icon: Play,
    text: "Free Scheduled simulation access.",
  },
];

export function RhCardBenefits({
  children,
  pricing,
}: {
  children?: ReactNode;
  pricing?: { amount: number; currency: string };
}) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-teal-50 p-5 sm:p-8 md:grid-cols-2 lg:flex-row">
      <div>
        <div className="mb-5 flex items-start gap-3">
          <div className="text-primary rounded-xl bg-white p-3">
            <IdCard aria-hidden="true" className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Your RH Membership Card Benefits
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Save on learning and stay up to date with nursing.
            </p>
          </div>
        </div>
        <ul className="grid gap-3">
          {BENEFITS.map(({ icon: Icon, text }, idx) => (
            <li
              key={text}
              className="flex items-start gap-3 text-sm leading-6 text-slate-700"
            >
              {/* <Icon
                aria-hidden="true"
                className="text-primary mt-1 size-5 shrink-0"
              /> */}

              <span>{idx + 1}. </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-green-200 pt-5">
          <p className="text-sm font-medium text-slate-700">
            RH Membership Card Price
          </p>
          <RhCardPrice amount={pricing?.amount} currency={pricing?.currency} />
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
      <div className="max-w-xs md:ml-auto">
        <Image
          src={
            "https://d2c3lsl35lix55.cloudfront.net/website-image/rh-member-card.png"
          }
          height={700}
          width={400}
          alt="RH membership card"
          className="h-auto w-full object-contain object-top lg:h-full lg:w-auto"
        />
      </div>
    </section>
  );
}
