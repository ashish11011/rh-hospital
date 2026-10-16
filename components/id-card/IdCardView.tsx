"use client";
import Image from "next/image";
import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, RotateCw, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { formatCardDate, formatProfession, getCardStatus } from "./idCardUtils";
import type { UserCardRecord } from "./types";

function CardArtwork({ back = false }: { back?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <div
        className="absolute inset-0"
        style={{
          background: back
            ? "radial-gradient(ellipse at 85% 10%, #166cff 0%, transparent 48%), linear-gradient(150deg, #3128bd 0%, #7323b8 48%, #250b45 100%)"
            : "radial-gradient(ellipse at 65% 25%, #127bff 0%, transparent 42%), linear-gradient(165deg, #3020e8 0%, #7618d5 54%, #360b51 100%)",
        }}
      />
      <div
        className="absolute -top-12 -left-20 h-[70%] w-[95%]"
        style={{
          background:
            "linear-gradient(125deg, #ffbe47 8%, #ff9389 47%, #ef57c3 90%)",
          clipPath: "polygon(0 0, 100% 0, 73% 100%, 0 77%)",
          opacity: back ? 0.22 : 1,
        }}
      />
      <div
        className="absolute top-[34%] -right-20 h-[48%] w-[115%] -rotate-[22deg]"
        style={{
          background:
            "linear-gradient(110deg, #5b20ed 8%, #a700ed 65%, #bd35df 100%)",
          opacity: back ? 0.25 : 0.9,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#250c3d]/95 via-[#3d1464]/20 to-transparent" />
      <div className="absolute inset-0 rounded-[inherit] ring-1 ring-white/20 ring-inset" />
    </div>
  );
}

function CardBrand({ badge, back = false }: { badge: string; back?: boolean }) {
  return (
    <div className="relative flex items-center justify-between gap-3">
      {back ? (
        <BrandLogo className="h-auto w-32 shrink-0 rounded-lg bg-white p-2 sm:w-36" />
      ) : (
        <span className="text-[10px] font-semibold tracking-[0.18em] text-white/90 sm:text-xs">
          RH HEALTHCARE
        </span>
      )}
      <span className="shrink-0 rounded-full border border-white/25 bg-black/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
        {badge}
      </span>
    </div>
  );
}

function CardDates({
  activationDate,
  validityDate,
  back = false,
}: {
  activationDate: string | null;
  validityDate: string | null;
  back?: boolean;
}) {
  return (
    <div className="relative grid grid-cols-2 gap-4 border-t border-white/15 pt-4">
      <div>
        <p className="text-[10px] tracking-wide text-white/60">
          {back ? "ACTIVATED" : "MEMBER SINCE"}
        </p>
        <p className="mt-1 text-xs font-medium sm:text-sm">
          {formatCardDate(activationDate)}
        </p>
      </div>
      <div className="border-l border-white/15 pl-4">
        <p className="text-[10px] tracking-wide text-white/60">VALID UNTIL</p>
        <p className="mt-1 text-xs font-medium sm:text-sm">
          {formatCardDate(validityDate)}
        </p>
      </div>
    </div>
  );
}

export function IdCardView({
  card,
  isPreview = false,
}: {
  card: UserCardRecord;
  isPreview?: boolean;
}) {
  const [showBack, setShowBack] = useState(false);
  const reducedMotion = useReducedMotion();
  const cardId = useId();
  const status = getCardStatus(card);
  const initials = card.fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const bloodGroup = card.bloodGroup
    ? `${card.bloodGroup}${card.rhFactor === "positive" ? "+" : card.rhFactor === "negative" ? "−" : ""}`
    : null;
  const memberId = card.memberShipId || "Pending";
  const membership =
    card.membershipPurchaseType === "free" ? "Free member" : "RH member";
  const details = [
    ["Member", card.fullName],
    ["RH member ID", memberId],
    ...(card.organizationName ? [["Organization", card.organizationName]] : []),
    ...(bloodGroup ? [["Blood group", bloodGroup]] : []),
  ];
  const faceStyle = {
    backfaceVisibility: "hidden" as const,
    WebkitBackfaceVisibility: "hidden" as const,
  };
  const flip = () => setShowBack((current) => !current);

  return (
    <article
      aria-label={
        isPreview ? "RH Membership Card preview" : "Your RH Membership Card"
      }
      className="w-full max-w-[440px]"
    >
      <div style={{ perspective: 1400 }}>
        <motion.div
          id={cardId}
          className="relative grid"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: showBack ? 180 : 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 180, damping: 24 }
          }
        >
          <div
            aria-hidden={showBack}
            inert={showBack}
            className="relative flex min-w-0 flex-col overflow-hidden rounded-[2rem] border-[6px] border-white bg-purple-900 p-5 text-white shadow-xl shadow-purple-950/15 [grid-area:1/1] sm:p-7"
            style={{ ...faceStyle, pointerEvents: showBack ? "none" : "auto" }}
          >
            <CardArtwork />
            <CardBrand badge={isPreview ? "Preview" : status} />

            <div className="relative mt-9 flex-1">
              <div className="relative w-fit">
                <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-full bg-white/90 text-3xl font-bold text-purple-800 shadow-lg ring-4 ring-white/25 sm:size-28">
                  {card.passportPhotoUrl ? (
                    <Image
                      src={card.passportPhotoUrl}
                      alt={`${card.fullName}'s passport photo`}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    initials || "RH"
                  )}
                </div>
                <span
                  aria-label={isPreview ? "Preview" : status}
                  className={`absolute right-1 bottom-1 size-5 rounded-full border-[3px] border-white ${status === "Active" && !isPreview ? "bg-emerald-500" : "bg-amber-400"}`}
                />
              </div>

              <h3 className="mt-5 text-3xl leading-tight font-semibold tracking-tight break-words sm:text-4xl">
                {card.fullName}
              </h3>
              <p className="mt-2 text-sm break-words text-white/80 sm:text-base">
                {formatProfession(card.profession, card.otherProfession)}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#21132f]/75 px-3.5 py-2 text-xs font-medium backdrop-blur-sm">
                  <ShieldCheck className="size-3.5" />
                  {membership}
                </span>
                {bloodGroup && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium backdrop-blur-sm">
                    Blood group {bloodGroup}
                  </span>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-white/15 bg-black/10 px-4 py-3.5">
                <p className="text-[10px] font-medium tracking-[0.2em] text-white/60">
                  MEMBER ID
                </p>
                <p className="mt-1.5 font-mono text-sm font-semibold break-words text-white sm:text-base">
                  {memberId}
                </p>
              </div>
            </div>

            {!isPreview && (
              <CardDates
                activationDate={card.activationDate}
                validityDate={card.validityDate}
              />
            )}
            <Button
              type="button"
              variant="secondary"
              aria-controls={cardId}
              aria-pressed={showBack}
              onClick={flip}
              className="relative mt-6 h-12 w-full rounded-full bg-white text-sm font-semibold text-purple-950 hover:bg-white/90"
            >
              Show card details <ArrowUpRight className="ml-1 size-4" />
            </Button>
          </div>

          <div
            aria-hidden={!showBack}
            inert={!showBack}
            className="relative flex min-w-0 flex-col overflow-hidden rounded-[2rem] border-[6px] border-white bg-purple-900 p-5 text-white shadow-xl shadow-purple-950/15 [grid-area:1/1] sm:p-7"
            style={{
              ...faceStyle,
              transform: "rotateY(180deg)",
              pointerEvents: showBack ? "auto" : "none",
            }}
          >
            <CardArtwork back />
            <CardBrand badge={isPreview ? "Preview" : status} back />
            <div className="relative mt-9 flex-1">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                <ShieldCheck className="size-6 text-white" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                Membership details
              </h3>
              <p className="mt-2 text-sm text-white/65">RH Membership Card</p>
              <dl className="mt-6 divide-y divide-white/10">
                {details.map(([label, value]) => (
                  <div key={label} className="py-3 first:pt-0">
                    <dt className="text-[10px] font-medium tracking-widest text-white/55 uppercase">
                      {label}
                    </dt>
                    <dd
                      className={`mt-1.5 text-sm font-medium break-words text-white ${label === "RH member ID" ? "font-mono" : ""}`}
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            {!isPreview && (
              <CardDates
                activationDate={card.activationDate}
                validityDate={card.validityDate}
                back
              />
            )}
            <Button
              type="button"
              variant="secondary"
              aria-controls={cardId}
              aria-pressed={showBack}
              onClick={flip}
              className="relative mt-6 h-12 w-full rounded-full bg-white text-sm font-semibold text-purple-950 hover:bg-white/90"
            >
              <RotateCw className="mr-1 size-4" /> Show front
            </Button>
          </div>
        </motion.div>
      </div>
    </article>
  );
}
