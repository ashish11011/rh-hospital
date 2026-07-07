import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { SeminarClient } from "./seminarClient";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconBrandYoutube,
  IconBulb,
  IconCertificate,
  IconMail,
  IconMapPinFilled,
  IconNote,
  IconPhone,
  IconStarFilled,
  IconUsers,
  IconUserScreen,
} from "@tabler/icons-react";
import { MapPin } from "lucide-react";

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
        <div className="">
          <Content />
        </div>
        <Suspense>
          <SeminarClient />
        </Suspense>
      </div>
    </>
  );
};

export default page;

function Content() {
  const benefits = [
    {
      icon: IconCertificate,
      text: (
        <>
          10 CNE <br /> Credit Hours
        </>
      ),
    },
    {
      icon: IconUsers,
      text: (
        <>
          Networking Opportunities with <br /> National Experts
        </>
      ),
    },
    {
      icon: IconBulb,
      text: (
        <>
          Exposure to Latest Trends in <br />
          Nursing Education & Leadership
        </>
      ),
    },
    {
      icon: IconUserScreen,
      text: (
        <>
          Opportunity to Showcase <br /> Research & Innovations
        </>
      ),
    },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="grid grid-cols-1 gap-12 py-12 md:grid-cols-5">
        <Image
          src={
            "https://d2c3lsl35lix55.cloudfront.net/website-image/Registration+Page.png"
          }
          height={500}
          width={700}
          className="w-full md:col-span-2"
          alt="seminar poster"
        />
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            lineHeight: 1.6,
            color: "#333",
            maxWidth: "800px",
            margin: "0 auto",
          }}
          className="md:col-span-3"
        >
          <h2 className="mb-6 text-xl font-medium text-[#c62828] md:text-2xl">
            🌍 GLOBAL NURSING LEADERSHIP & EDUCATION SUMMIT 2026
          </h2>

          {/* <h3 className="text-[#0d47a1]">
            🏆 Best Nurses & Nursing Educators Awards 2026
          </h3> */}

          <p className="mb-4">
            <strong>
              A Step Towards Excellence, A Vision for the Future of Nursing!
            </strong>
          </p>

          <p>
            Join us for the{" "}
            <strong>Global Nursing Leadership & Education Summit 2026</strong>,
            a prestigious national event dedicated to advancing nursing
            education, leadership, innovation, and professional excellence. The
            summit will bring together nursing educators, healthcare leaders,
            researchers, students, and practitioners from across the country to
            share knowledge, celebrate achievements, and shape the future of
            nursing.
          </p>

          <p className="text-primary mt-4 text-xl font-semibold">
            Save the date 5th – 6th September 2026 (Saturday & Sunday){" "}
          </p>

          <div className="h-6"></div>
          <hr />
          <div className="h-6"></div>

          <h3 className="pt-2 font-semibold">🔑 Summit Highlights</h3>

          <ul className="list-disc pl-4">
            <li>Nursing Leadership & Professional Development</li>
            <li>Nursing Education & Academic Excellence</li>
            <li>Evidence-Based Practice & Research</li>
            <li>Innovation in Healthcare & Nursing</li>
            <li>Recognition of Outstanding Nursing Professionals</li>
            <li>Best Nurses & Nursing Educators Awards 2026</li>
            <li>Networking with National Nursing Leaders & Educators</li>
          </ul>

          <Link href={"#registration-form"}>
            <Button className="mt-6 h-10 min-w-32 rounded-sm font-semibold md:min-w-80">
              Register Now
            </Button>
          </Link>
        </div>

        {/* <h3 className="pt-4 font-semibold">🎯 Who Can Participate?</h3>

      <ul>
        <li>ANM Nursing Students</li>
        <li>GNM Students</li>
        <li>B.Sc Nursing Students</li>
        <li>Post Basic B.Sc Nursing Students</li>
        <li>M.Sc Nursing Students</li>
        <li>PhD Scholars</li>
        <li>Nursing Faculty & Educators</li>
        <li>Nursing Administrators</li>
        <li>Healthcare Professionals</li>
        <li>Researchers & Academicians</li>
      </ul>

      <h3 className="pt-4 font-semibold">🏆 Awards & Recognition</h3>

      <p>
        <strong>Best Nurses & Nursing Educators Awards 2026</strong>
        <br />
        The summit will recognize and honor exceptional contributions made by
        nursing professionals and educators in the field of healthcare and
        nursing education.
      </p>

      <h3 className="pt-4 font-semibold">📜 Certification & Benefits</h3>

      <ul>
        <li>Participation Certificate</li>
        <li>5 CNE Credit Hours for attending 1 day of the summit</li>
        <li>10 CNE Credit Hours for attending both days of the summit</li>
        <li>Networking Opportunities with National Experts</li>
        <li>Exposure to Latest Trends in Nursing Education & Leadership</li>
        <li>Opportunity to Showcase Research & Innovations</li>
      </ul>

      <h3 className="pt-4 font-semibold">📊 Event Statistics</h3>

      <ul>
        <li>👥 1000+ Delegates</li>
        <li>🏅 200+ Award Nominees</li>
        <li>🏢 20+ Exhibitors</li>
        <li>🎤 15+ National Speakers</li>
      </ul>

      <h3>📅 Event Details</h3>

      <p>
        <strong> 📘 Mode: Offline and Online</strong>
        <br />
        <strong>Venue:</strong> Rajasthan International Centre (RIC), Jhalana
        Doongri, Jaipur, Rajasthan
        <br />
        <strong>Presented By:</strong> RH Healthcare Pvt. Ltd. & Nursing
        Teachers Association of India (NTAI)
        <br />
        <strong>Special Occasion:</strong> Celebrating Teachers&apos; Day –
        Honoring Educators, Inspiring Futures
      </p>

      <h3 className="pt-4 font-semibold">📍 Venue Address</h3>

      <p>
        Rajasthan International Centre (RIC)
        <br />
        Jhalana Doongri, Jaipur, Rajasthan
      </p>

      <h3>📞 Contact Details</h3>

      <p>
        📞 +91-9928907780
        <br />
        📞 +91-9829507781
        <br />
        📧 connect.rhhealth@gmail.com
      </p>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#fff8e1",
          borderLeft: "5px solid #f9a825",
        }}
      >
        <strong>📌 Important Note:</strong>
        <br />
        All participants must join the official WhatsApp group for further
        communication, event updates, schedules, and important announcements.
        <div className="h-4"></div>
        <Link
          className="text-blue-600 underline"
          href="https://chat.whatsapp.com/ElsWv1MjOBHBLeYWVEJbg9?s=cl&p=a&mlu=3"
        >
          Join WhatsApp Group
        </Link>
      </div> */}
      </div>
      <div className="bg-primary flex w-full flex-col justify-between gap-4 p-4 font-semibold text-white md:flex-row">
        <p className="flex gap-2">
          <IconMapPinFilled className="mt-1 shrink-0 md:mt-0" />
          Rajasthan International Centre (RIC), Jhalana Doongri, Jaipur,
          Rajasthan
        </p>
        <div className="ml-auto flex gap-5">
          <IconBrandInstagram />
          <IconBrandFacebook />
          <IconBrandYoutube />
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-6 bg-gray-50 p-4 md:grid-cols-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;

          return (
            <div className="flex flex-col gap-2 md:items-center" key={index}>
              <Icon className="size-8 md:size-10" />
              <p className="text-sm font-medium md:text-center md:text-base">
                {benefit.text}
              </p>
            </div>
          );
        })}
      </div>
      <div className="grid w-full grid-cols-1 gap-5 py-10 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="flex items-center gap-2 pt-4 text-xl font-semibold">
            {" "}
            <IconStarFilled className="text-primary size-8" /> Event Benefits
          </h3>

          <ul className="list-disc space-y-1 pt-4 pl-4">
            <li>Participation Certificate</li>
            <li>5 CNE Credit Hours for attending 1 day of the summit</li>
            <li>10 CNE Credit Hours for attending both days of the summit</li>
            <li>Networking Opportunities with National Experts</li>
            <li>Exposure to Latest Trends in Nursing Education & Leadership</li>
            <li>Opportunity to Showcase Research & Innovations</li>
          </ul>
        </div>
        <div className="flex flex-col gap-5">
          <div className="space-y-2 rounded-lg border bg-green-50 p-4">
            <p className="flex items-center gap-2 text-xl">
              <IconBrandWhatsapp />
              <strong> Important Note</strong>
            </p>
            <p>
              All participants must join the official WhatsApp group for further
              communication.
            </p>
            <Link
              target="_blank"
              className="text-blue-600 underline"
              href="https://chat.whatsapp.com/ElsWv1MjOBHBLeYWVEJbg9?s=cl&p=a&mlu=3"
            >
              Join WhatsApp Group
            </Link>
          </div>
          <div className="rounded-xl border p-4">
            <p className="flex items-center gap-2 text-xl">
              <strong> Contact Details</strong>
            </p>
            <p className="mt-4 flex items-center gap-1">
              <IconPhone size={20} />{" "}
              <a className="text-blue-600 underline" href="tel:+919928907780">
                +91-9928907780
              </a>
            </p>
            <p className="flex items-center gap-1">
              <IconPhone size={20} />{" "}
              <a className="text-blue-600 underline" href="tel:+919829507781">
                +91-9829507781
              </a>
            </p>
            <p className="flex items-center gap-1">
              <IconMail className="shrink-0" size={20} />
              <a
                className="break-all text-blue-600 underline"
                href="mailto:rhhealthcaresimulationcenter@gmail.com"
              >
                rhhealthcaresimulationcenter@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
