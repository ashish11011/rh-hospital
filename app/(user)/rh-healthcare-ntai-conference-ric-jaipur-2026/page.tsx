import { SeminarClient } from "./seminarClient";
import { Metadata } from "next";
import { PageContentClient } from "./content";
import { Suspense } from "react";
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Global Nursing Leadership & Education Summit 2026 | RH Healthcare",
  description:
    "Join the Global Nursing Leadership & Education Summit 2026 presented by RH Healthcare & NTAI. Celebrate nursing excellence at RIC, Jaipur.",
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
        <Suspense>
          <SeminarClient />
        </Suspense>
      </div>
    </>
  );
};

export default page;
