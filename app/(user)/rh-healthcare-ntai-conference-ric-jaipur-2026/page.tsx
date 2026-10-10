import { SeminarClient } from "./seminarClient";
import { Metadata } from "next";
import { PageContentClient } from "./content";
import { Suspense } from "react";
import Image from "next/image";
import { GLOBAL_CONFRENCE_IMAGES } from "@/lib/constants";
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Global Nursing Summit 2026 | RH Healthcare",
  description:
    "Join the Global Nursing Summit 2026 presented by RH Healthcare & NTAI. Celebrate nursing excellence at RIC, Jaipur.",
  alternates: {
    canonical: "/rh-healthcare-ntai-conference-ric-jaipur-2026",
  },
  openGraph: {
    images: [
      "https://d2c3lsl35lix55.cloudfront.net/website-image/Registration+Page.png",
    ],
  },
  twitter: {
    images: [
      "https://d2c3lsl35lix55.cloudfront.net/website-image/Registration+Page.png",
    ],
  },
};

const page = () => {
  return (
    <>
      <div>
        <PageContentClient />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2">
          {GLOBAL_CONFRENCE_IMAGES.map((img, idx) => {
            return (
              <Image
                src={img}
                alt="Hero Image"
                width={1920}
                height={1080}
                className="mt-10"
              />
            );
          })}
        </div>
        <div className="mt-10">{/* <SeminarClient /> */}</div>
      </div>
    </>
  );
};

export default page;
