import type { ReactNode } from "react";
import { IdCard } from "lucide-react";
import Image from "next/image";
import { RH_CARD_DISCOUNT_PERCENT } from "@/lib/constants";
import { RhCardPrice } from "./RhCardPrice";

const BENEFIT_GROUPS = [
  {
    title: "Exclusive Learning Benefits",
    benefits: [
      {
        title: `${RH_CARD_DISCOUNT_PERCENT}% Discount on Workshops & Courses`,
        description:
          "Enjoy special member pricing on all simulation-based workshops, skill-development courses, and certification programs.",
      },
      {
        title: "Simulation-Based Teaching",
        description:
          "Learn through high-fidelity manikins, task trainers, and realistic clinical scenarios in a safe, hands-on environment.",
      },
      {
        title: "Skill Development",
        description:
          "Enhance clinical skills, critical thinking, emergency response, teamwork, communication, and decision-making abilities.",
      },
      {
        title: "Certification Provided",
        description:
          "Receive a certificate upon successful completion of workshops and courses, strengthening your professional profile.",
      },
      {
        title: "Regular Updates",
        description:
          "Stay informed about new courses, workshops, clinical guidelines, training modules, and learning resources.",
      },
    ],
  },
  {
    title: "Career & Professional Growth",
    benefits: [
      {
        title: "Educational Resources",
        description:
          "Get access to study materials, clinical guidelines, e-learning content, videos, and updated healthcare resources.",
      },
      {
        title: "Job Opportunities",
        description:
          "Receive updates on relevant healthcare job openings, career guidance, and placement-related opportunities.",
      },
      {
        title: "Professional Networking",
        description:
          "Connect with doctors, nurses, educators, healthcare professionals, and industry experts.",
      },
      {
        title: `${RH_CARD_DISCOUNT_PERCENT}% Discount on Conferences`,
        description:
          "Avail exclusive discounts on conferences, seminars, and academic events organized by the center.",
      },
      {
        title: "Technical Guidance",
        description:
          "Receive expert support and guidance related to simulation equipment, clinical procedures, and skill-based training.",
      },
    ],
  },
  {
    title: "Additional Member Privileges",
    benefits: [
      {
        title: "Educational Visits",
        description:
          "Participate in educational visits to simulation centers, healthcare facilities, and academic institutions.",
      },
      {
        title: "Discounts on Workshops & Seminars",
        description:
          "Get special membership discounts on workshops, seminars, CME activities, and skill-development events.",
      },
    ],
  },
];

export function RhCardBenefits({
  children,
  pricing,
  showPurchase = true,
}: {
  children?: ReactNode;
  pricing?: { amount: number; currency: string };
  showPurchase?: boolean;
}) {
  return (
    <section
      id="membership-benefits"
      aria-label="RH Membership Card benefits"
      className="scroll-mt-24 space-y-8 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-teal-50 p-5 sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div className="text-primary rounded-xl bg-white p-3">
              <IdCard aria-hidden="true" className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                RH Membership Card
              </h2>
              <p className="mt-2 text-lg font-medium text-slate-700">
                Membership Benefits
              </p>
            </div>
          </div>
          {showPurchase && (
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-slate-700">
                RH Membership Card Price
              </p>
              <RhCardPrice
                amount={pricing?.amount}
                currency={pricing?.currency}
              />
            </div>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
        <Image
          src="https://media.rhhealthcaresimulation.com/public/website-image/rh-member-card.png"
          height={700}
          width={400}
          alt="RH Membership Card"
          className="mx-auto h-auto w-40 shrink-0 object-contain sm:mx-0 sm:w-72"
        />
      </div>
      <div className="grid gap-8 border-t border-green-200 pt-6 lg:grid-cols-3">
        {BENEFIT_GROUPS.map(({ title, benefits }) => (
          <div key={title} className="min-w-0">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              {title}
            </h3>
            <ul className="list-disc space-y-4 pl-5 text-sm leading-6 text-slate-700 marker:text-green-700">
              {benefits.map((benefit) => (
                <li key={benefit.title} className="pl-1">
                  <span className="font-semibold text-slate-900">
                    {benefit.title}
                  </span>
                  {" — "}
                  {benefit.description}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
