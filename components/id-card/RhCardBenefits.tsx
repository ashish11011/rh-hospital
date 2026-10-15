"use client";
import { useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

import Image from "next/image";
import { ChevronDown, IdCard } from "lucide-react";
import { RH_CARD_DISCOUNT_PERCENT } from "@/lib/constants";
import { RhCardPrice } from "./RhCardPrice";
import { CreateRhCardLink } from "./CreateRhCardLink";

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
  const containerRef = useRef<HTMLDivElement>(null);
  // First group open by default
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <div className="container mx-auto p-0">
      <section
        ref={containerRef}
        id="membership-benefits"
        aria-label="RH Membership Card benefits"
        className="grid grid-cols-1 gap-8 overflow-x-hidden overflow-y-auto rounded-2xl px-4 py-10 sm:px-8 sm:py-16 md:grid-cols-5 md:gap-12"
      >
        {/* <div className="sticky top-0 z-20 col-span-5 flex w-full items-start gap-3 bg-white">
          <div className="text-primary rounded-xl bg-white p-1.5">
            <IdCard aria-hidden="true" className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              RH Membership Card
            </h2>
          </div>
        </div> */}
        <div className="order-2 col-span-3 border-t border-green-200 pt-6 md:order-1">
          {BENEFIT_GROUPS.map(({ title, benefits }, i) => (
            <motion.div
              key={title}
              className="min-w-0 border-b border-slate-100 py-4"
              initial={{ opacity: 0, filter: "blur(12px)", y: 40 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              viewport={{
                root: containerRef,
                once: true,
                margin: "0px 0px -15% 0px",
              }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.08,
              }}
            >
              {/* Title — hover to expand benefits */}
              <h3
                className="flex cursor-pointer items-center gap-3 py-1 text-base font-semibold text-slate-900 transition-colors duration-200 hover:text-green-700 sm:text-lg"
                onClick={() => setActiveIndex(i + 1)}
                onMouseEnter={() => setActiveIndex(i + 1)}
              >
                <span className="text-sm font-bold text-green-600 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{title}</span>
                <motion.span
                  animate={{ rotate: activeIndex === i + 1 ? 180 : 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="text-slate-400"
                >
                  <ChevronDown className="size-5" />
                </motion.span>
              </h3>

              {/* Expandable benefit list */}
              <AnimatePresence initial={false} mode="sync">
                {activeIndex === i + 1 && (
                  <motion.div
                    key="body"
                    className="overflow-hidden"
                    initial={{ height: 0, opacity: 0, filter: "blur(8px)" }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{ height: 0, opacity: 0, filter: "blur(8px)" }}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <ul className="list-disc space-y-4 pt-4 pl-5 text-sm leading-6 text-slate-700 marker:text-green-700">
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
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="order-1 col-span-2 flex flex-col items-center gap-6 md:sticky md:top-0 md:order-2 md:items-end">
          <div className="min-w-0">
            <Image
              src="https://media.rhhealthcaresimulation.com/public/website-image/rh-member-card.png"
              height={700}
              width={400}
              alt="RH Membership Card"
              className="mx-auto mt-6 h-auto w-48 shrink-0 object-contain sm:w-64 md:w-72"
            />
            {showPurchase && (
              <div className="mt-6 space-y-2">
                {/* <p className="text-sm font-medium text-slate-700">
                  RH Membership Card Price
                </p> */}
                <RhCardPrice
                  amount={pricing?.amount}
                  currency={pricing?.currency}
                />
              </div>
            )}
            <div className="h-2"></div>
            <CreateRhCardLink />
          </div>
        </div>
      </section>
    </div>
  );
}
