import {
  BellRing,
  Download,
  ExternalLink,
  IdCard,
  Play,
  PlayCircle,
  Smartphone,
} from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import mobileAppPreview from "@/public/RH_Healthcare_Mobile_app-removebg-preview.png";

const appFeatures = [
  {
    icon: PlayCircle,
    title: "Resume lessons",
    description: "Pick up your courses right where you left off.",
  },
  {
    icon: Download,
    title: "Download certificates",
    description: "Keep your earned certificates close at hand.",
  },
  {
    icon: IdCard,
    title: "View RH Membership",
    description: "Access your RH membership details on your phone.",
  },
  {
    icon: BellRing,
    title: "Upcoming events & notifications",
    description: "Stay updated on RH events and announcements.",
  },
];

export const MobileAppCTA = () => {
  return (
    <section
      aria-labelledby="mobile-app-heading"
      className="container py-12 md:py-16"
    >
      <div className="bg-primary relative isolate overflow-hidden rounded-3xl text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-white/10 via-transparent to-black/15"
        />
        <div className="grid items-center gap-10 px-6 pt-9 sm:px-10 sm:pt-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-8 lg:px-12 lg:pt-0">
          <div className="lg:py-14">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wider">
              <Smartphone aria-hidden="true" className="size-3.5" />
              LEARN ON THE GO
            </div>
            <h2
              id="mobile-app-heading"
              className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl lg:text-[2.75rem]"
            >
              RH Healthcare
              <span className="block text-green-200">Mobile App</span>
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-green-50/90">
              Take your learning with you. Watch your courses and stay connected
              with RH Healthcare, all from your phone.
            </p>

            <ul className="my-8 grid gap-x-6 gap-y-6 sm:grid-cols-2">
              {appFeatures.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                    <Icon
                      aria-hidden="true"
                      className="size-5 text-green-200"
                    />
                  </span>
                  <div>
                    <h3 className="text-sm leading-snug font-semibold">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-green-50/80">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Button
              asChild
              className="h-auto min-h-14 w-full justify-start gap-3 rounded-xl border-white/15 bg-slate-950 px-5 py-3 text-white shadow-lg hover:bg-slate-900 focus-visible:ring-white/70 sm:w-auto"
            >
              <a
                target="_blank"
                href="https://play.google.com/store/apps/details?id=com.rh.healthcare"
              >
                <Image
                  src={"/google-play-logo.png"}
                  alt="Play Store"
                  width={32}
                  height={32}
                />
                <span className="text-left">
                  <span className="block text-[10px] leading-tight font-medium tracking-widest uppercase">
                    Get it on
                  </span>
                  <span className="block text-lg leading-snug font-semibold">
                    Google Play
                  </span>
                </span>
                <ExternalLink
                  aria-hidden="true"
                  className="ml-4 size-4 text-white/60"
                />
              </a>
            </Button>
          </div>

          <div className="relative mx-auto flex w-full max-w-72 items-end justify-center self-end sm:max-w-80 lg:max-w-none">
            {/* <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[-15%] top-[15%] -z-10 aspect-square rounded-full border border-white/10 bg-white/5"
            /> */}
            <Image
              src={mobileAppPreview}
              alt="RH Healthcare app showing a course and lesson progress on a phone"
              sizes="(max-width: 639px) 288px, (max-width: 1023px) 320px, 384px"
              className="h-auto w-full drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
