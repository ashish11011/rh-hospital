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
  IconPhone,
  IconStarFilled,
  IconUsers,
  IconUserScreen,
} from "@tabler/icons-react";

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

const dayOneAgenda = [
  {
    time: "09:00-09:30 AM",
    activity: "Registration",
    details:
      "Participant check-in, on-site registration & poster installation.",
  },
  {
    time: "09:30-09:45 AM",
    activity: "Welcome & Briefing",
    details: "Guidelines for paper & poster presentation.",
  },
  {
    time: "09:45-10:00 AM",
    activity: "Introduction of Scientific Committees",
    details: "Introduction of jury members & chair persons.",
  },
  {
    time: "10:00-11:30 AM",
    activity: "Paper Presentation Session- I",
    details: "Nursing Education, Clinical Nursing & Research.",
  },
  {
    time: "11:30-11:45 AM",
    activity: "Tea Break",
    details: "-",
  },
  {
    time: "11:45-01:15 PM",
    activity: "Paper Presentation Session- II",
    details: "Innovation, AI, Leadership & Healthcare.",
  },
  {
    time: "01:15-02:00 PM",
    activity: "Lunch Break",
    details: "-",
  },
  {
    time: "02:00-03:00 PM",
    activity: "Paper Presentation Session- III",
    details: "Nursing Education & Research.",
  },
  {
    time: "03:00-04:15 PM",
    activity: "Group Discussion",
    details: "By experts on emergent issues in nursing.",
  },
  {
    time: "04:15-04:45 PM",
    activity: "Judges Deliberation",
    details: "Final evaluation & result submission.",
  },
  {
    time: "04:45-05:00 PM",
    activity: "Vote of Thanks",
    details: "Closing of scientific sessions.",
  },
];

const dayTwoAgenda = [
  {
    time: "08:30 AM-10:00 AM",
    activity: "Registration & Refreshments",
    details: "-",
  },
  {
    time: "10:00 AM-10:10 AM",
    activity: "Inaugural Ceremony",
    details: "Honorable Guests",
  },
  {
    time: "10:10 AM-10:15 AM",
    activity: "Welcome of Honorable Chief Guest & Special Guests",
    details: "-",
  },
  {
    time: "10:15 AM-10:20 AM",
    activity: "Welcome Address",
    details: "-",
  },
  {
    time: "10:20 AM-10:40 AM",
    activity: "Plenary Session - I",
    details: "-",
  },
  {
    time: "10:40 AM-11:30 AM",
    activity: "Robotic Nursing: Advancing Excellence in Clinical Practice",
    details: "-",
  },
  {
    time: "11:30 AM-11:40 AM",
    activity: "Plenary Session - II",
    details: "-",
  },
  {
    time: "11:40 AM-12:20 PM",
    activity:
      "Simulation to Smart Practice: Empowering Future Nurses through Artificial Intelligence",
    details: "-",
  },
  {
    time: "12:20 PM-12:50 PM",
    activity:
      "Artificial Intelligence in Surgical Care: The Evolving Role of Nurses",
    details: "-",
  },
  {
    time: "12:50 PM-01:30 PM",
    activity:
      "Artificial Intelligence enabled Nursing Education: Transforming Learning for the Future",
    details: "-",
  },
  {
    time: "01:30 PM-01:45 PM",
    activity: "Skit on Artificial Intelligence",
    details: "-",
  },
  {
    time: "01:45 PM-02:30 PM",
    activity: "Lunch",
    details: "-",
  },
  {
    time: "02:30 PM-02:50 PM",
    activity: "Plenary Session - IV",
    details: "-",
  },
  {
    time: "02:50 PM-03:30 PM",
    activity:
      "Transformation Nursing Education through Technology, Leadership & Experience Learning.",
    details: "-",
  },
  {
    time: "03:30 PM-03:50 PM",
    activity: "Plenary Session - V",
    details: "-",
  },
  {
    time: "03:50 PM-04:10 PM",
    activity: "Holographic Demonstration",
    details: "-",
  },
  {
    time: "04:10 PM-04:30 PM",
    activity: "Robotic Based Simulation Skill Training",
    details: "-",
  },
  {
    time: "04:30 PM-05:00 PM",
    activity: "Award Ceremony",
    details: "Honorable Guests",
  },
  {
    time: "05:00 PM-05:15 PM",
    activity: "Vote of Thanks",
    details: "-",
  },
];

const eventStats = [
  {
    value: "1500+",
    label: "Nursing professionals",
    note: "Registered so far",
  },
  {
    value: "10",
    label: "CNE/RNC credit hours",
    note: "For two-day participation",
  },
  {
    value: "Hybrid",
    label: "Offline + Online",
    note: "International conference",
  },
];

const summitHighlights = [
  "International Scientific Conference",
  "Scientific Paper Presentation",
  "Scientific Poster Presentation",
  "Expert Panel Discussion on Current Nursing Issues",
  "Excellence Nursing Leadership Awards 2026",
  "Excellence Nursing Teachers Awards 2026",
  "Excellence Clinical Nurse Awards 2026",
  "Simulation-Based Learning Sessions",
  "AI & Robotic Nursing and Healthcare Sessions",
  "Networking with National & International Experts",
  "Exhibition & Industry Showcase",
  "Hybrid Participation",
];

const whyParticipate = [
  "Enhance knowledge and professional skills",
  "Network with national & international experts",
  "Explore innovations in nursing and healthcare",
  "Engage with AI and simulation-based clinical education",
  "Contribute to research & evidence-based nursing practice",
  "Get recognized through prestigious awards",
];

const audience = [
  "Nursing Faculty Members",
  "Nursing Officers & Clinical Nurses",
  "Nursing Administrators",
  "GNM, B.Sc., M.Sc. Nursing Students",
  "Nursing Researchers",
  "Hospital Administrators",
  "Healthcare Educators",
  "Allied Health Professionals",
  "Healthcare Industry Representatives",
  "National & International Delegates",
];

const importantDates = [
  { label: "Paper/Poster Submission Opens", value: "25 June 2026" },
  { label: "Last Date for Paper/Poster Submission", value: "15 August 2026" },
  { label: "Notification of Acceptance", value: "22 August 2026" },
];

const paperPosterGuidelines = [
  "Participant must be registered for both days of the conference.",
  "Abstracts must be based on original research studies.",
  "Abstracts must be submitted in MS Word with a maximum of 300 words.",
  "Paper presentation must be in 8-10 slides in .pptx format.",
  "Submit abstracts on or before 15 August 2026 by email with subject: Abstract Submission.",
  "Poster presentation flex size is 6x3 ft; bring your own roll-up standee.",
];

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
      text: <>Networking Opportunities</>,
    },
    {
      icon: IconBulb,
      text: (
        <>
          Latest Trends in <br />
          Nursing Education
        </>
      ),
    },
    {
      icon: IconUserScreen,
      text: <>Showcase Research & Innovations</>,
    },
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 md:pt-6">
      <div className="w-full py-12">
        <p className="text-primary text-sm font-semibold uppercase">
          RH Healthcare Pvt. Ltd. in collaboration with NTAI
        </p>
        <h2 className="mt-2 text-2xl leading-tight font-semibold md:text-4xl">
          GLOBAL NURSING LEADERSHIP & EDUCATION SUMMIT 2026
        </h2>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
          A two-day hybrid international nursing conference focused on
          transforming nursing and shaping the future of healthcare through
          artificial intelligence, innovation, leadership, and simulation-based
          nursing education.
        </p>

        <Image
          src={
            "https://d2c3lsl35lix55.cloudfront.net/website-image/confrence-registration.png"
          }
          height={1200}
          width={1200}
          className="mt-6 w-full"
          alt="seminar poster"
        />

        <div className="mt-10 overflow-hidden rounded-md border bg-white">
          <div className="bg-primary px-5 py-4 text-white">
            <p className="text-sm font-semibold uppercase">
              Hybrid International Conference
            </p>
            <h3 className="mt-1 text-xl font-semibold">
              Transforming Nursing: Shaping the Future of Healthcare
            </h3>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-2 font-semibold">
                AI, innovation, leadership & simulation-based nursing education
              </p>
              <p className="text-sm leading-6 text-slate-700">
                Presented by RH Healthcare Pvt. Ltd. in collaboration with the
                Nursing Teachers Association of India (NTAI), affiliated with
                the Commonwealth Nurses & Midwives Federation, London (UK), and
                Rajasthan Rajya Karmachari Mahasangh (BMS).
              </p>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-md bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-900">Venue</dt>
                  <dd className="mt-1 text-slate-700">
                    Rajasthan International Centre (RIC), Jhalana Doongri,
                    Jaipur
                  </dd>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-900">Date</dt>
                  <dd className="mt-1 text-slate-700">05-06 September 2026</dd>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-900">Time</dt>
                  <dd className="mt-1 text-slate-700">9:00 AM onwards</dd>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-900">
                    Participation
                  </dt>
                  <dd className="mt-1 text-slate-700">Offline + Online</dd>
                </div>
              </dl>
            </div>

            <div className="bg-primary/10 flex flex-col justify-between rounded-md p-4">
              <div className="mt-6 rounded-md bg-white p-4 text-sm">
                <p className="font-semibold text-slate-950">Contact Details</p>
                <div className="mt-3 space-y-1.5 text-slate-700">
                  <p>
                    <a className="hover:text-primary" href="tel:+919928907780">
                      +91-9928907780
                    </a>
                  </p>
                  <p>
                    <a className="hover:text-primary" href="tel:+919829507781">
                      +91-9829507781
                    </a>
                  </p>
                  <p>
                    <a
                      className="hover:text-primary break-all"
                      href="mailto:rhhealthcaresimulationcenter@gmail.com"
                    >
                      rhhealthcaresimulationcenter@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              <Link href={"#registration-form"}>
                <Button className="mt-6 h-11 w-full rounded-sm font-semibold">
                  Register Now
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:mt-8 md:grid-cols-3">
          {eventStats.map((item) => (
            <div className="rounded-md border bg-white p-4" key={item.label}>
              <p className="text-3xl font-semibold text-slate-950">
                {item.value}
              </p>
              <p className="mt-1 font-semibold text-slate-800">{item.label}</p>
              <p className="mt-1 text-sm text-slate-600">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="">
            <h3 className="text-xl font-semibold">Why participate?</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {whyParticipate.map((item) => (
                <li className="flex gap-2" key={item}>
                  <span className="bg-primary mt-2 size-1.5 shrink-0 rounded-full" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="">
            <h3 className="text-xl font-semibold">
              Paper/poster presentation guidelines
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {paperPosterGuidelines.map((item) => (
                <li className="flex gap-2" key={item}>
                  <span className="bg-primary mt-2 size-1.5 shrink-0 rounded-full" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-10 rounded-md border bg-white">
          <div className="bg-primary/10 border-b p-4">
            <p className="text-primary text-sm font-semibold">
              Scientific Paper & Poster Presentation Schedule
            </p>
            <h3 className="mt-1 text-xl font-semibold">
              Agenda: Day 1, 05 September 2026, Saturday
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-slate-700">
                <tr className="border-b">
                  <th className="w-14 px-4 py-3 font-semibold">Sr. No.</th>
                  <th className="w-40 px-4 py-3 font-semibold">Time</th>
                  <th className="w-60 px-4 py-3 font-semibold">Activity</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {dayOneAgenda.map((item, index) => (
                  <tr className="border-b last:border-b-0" key={item.time}>
                    <td className="px-4 py-3 font-semibold">{index + 1}.</td>
                    <td className="px-4 py-3 font-medium">{item.time}</td>
                    <td className="px-4 py-3 font-medium">{item.activity}</td>
                    <td className="px-4 py-3 text-slate-700">{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-md border bg-white">
          <div className="bg-primary/10 border-b p-4">
            <p className="text-primary text-sm font-semibold">
              Main Conference Schedule
            </p>
            <h3 className="mt-1 text-xl font-semibold">
              Agenda: Day 2, 06 September 2026, Sunday
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-slate-700">
                <tr className="border-b">
                  <th className="w-14 px-4 py-3 font-semibold">Sr. No.</th>
                  <th className="w-44 px-4 py-3 font-semibold">Time</th>
                  <th className="w-80 px-4 py-3 font-semibold">
                    Agenda/Session
                  </th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {dayTwoAgenda.map((item, index) => (
                  <tr className="border-b last:border-b-0" key={item.time}>
                    <td className="px-4 py-3 font-semibold">{index + 1}.</td>
                    <td className="px-4 py-3 font-medium">{item.time}</td>
                    <td className="px-4 py-3 font-medium">{item.activity}</td>
                    <td className="px-4 py-3 text-slate-700">{item.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="bg-primary flex w-full flex-col justify-between gap-4 p-4 font-semibold text-white md:flex-row">
        <p className="flex gap-2">
          <IconMapPinFilled className="mt-1 shrink-0 md:mt-0" />
          Rajasthan International Centre (RIC), Jhalana Doongri, Jaipur,
          Rajasthan
        </p>
        <div className="ml-auto flex gap-5">
          <Link
            target="_blank"
            href={"https://www.facebook.com/rhhealthcaresimulationcenter/"}
          >
            <IconBrandFacebook />
          </Link>
          <Link
            target="_blank"
            href={"https://www.instagram.com/rhhealthcare_in/"}
          >
            <IconBrandInstagram />
          </Link>
          <Link
            target="_blank"
            href={"https://www.youtube.com/@RHHealthcareINDIA"}
          >
            <IconBrandYoutube />
          </Link>
        </div>
      </div>
      {/* <div className="grid w-full grid-cols-1 gap-6 bg-gray-50 p-4 md:grid-cols-4">
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
      </div> */}
    </div>
  );
}
