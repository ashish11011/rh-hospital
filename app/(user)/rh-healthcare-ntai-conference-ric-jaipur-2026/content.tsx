"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBulb,
  IconCertificate,
  IconMapPinFilled,
  IconUsers,
  IconUserScreen,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 36,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.04,
      duration: 0.3,
      ease: "easeOut" as const,
    },
  }),
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
    details: "Prof. (Dr.) Farukh Khan (National President of NTAI)",
  },
  {
    time: "10:20 AM-10:40 AM",
    activity: "Plenary Session - I",
    details: "Prof. (Dr.) Radha Saini, Mr. Anesh Kumar Saini",
  },
  {
    time: "10:40 AM-11:10 AM",
    activity: "Robotic Nursing: Advancing Excellence in Clinical Practice",
    details: `Prof. (Dr.) Manju Chhugani, Dr. Suresh Kumar Sharma`,
  },
  {
    time: "11:10 AM-11:20 AM",
    activity: "Plenary Session - II",
    details: "Mrs. Rinki Dang, Prof. R.K. Saini",
  },
  {
    time: "11:20 AM-12:00 PM",
    activity:
      "Simulation to Smart Practice: Empowering Future Nurses through Artificial Intelligence",
    details: `Prof. (Dr.) Sukhpal Kaur, Mr. Ghanshyam Jangid`,
  },
  {
    time: "12:00 PM-12:30 PM",
    activity:
      "Artificial Intelligence in Surgical Care: The Evolving Role of Nurses",
    details: "Prof. (Dr.) Meryem Yavuz, Prof. (Dr.) Binu Joe",
  },
  {
    time: "12:30 PM-01:00 PM",
    activity:
      "Artificial Intelligence enabled Nursing Education: Transforming Learning for the Future",
    details: "Prof. (Dr.) I Clement, Prof. Dr. Hardeep Kaur",
  },
  {
    time: "01:00 PM-01:15 PM",
    activity: "Plenary Session - III",
    details: "Prof. (Dr.) Anjali Vijay Kulthe, Ms. Anita K Pawar",
  },
  {
    time: "01:15 PM-02:00 PM",
    activity: "Lunch",
    details: "-",
  },
  {
    time: "02:00 PM-02:20 PM",
    activity: "Plenary Session - IV",
    details: "Prof. (Dr.) Marwa, Prof. Himanshu Trivedi",
  },
  {
    time: "02:20 PM-03:00 PM",
    activity:
      "Transformation Nursing Education through Technology, Leadership & Experience Learning.",
    details: `Prof. (Dr.) Amandeep Kaur Bajwa, Prof. (Dr.) Ashok Dhaka Vishnoi`,
  },
  {
    time: "03:00 PM-03:30 PM",
    activity: "Plenary Session - V",
    details: "Prof. S S P Warnakulasuriya, Prof. Navneeta Khrist",
  },
  {
    time: "03:30 PM-04:00 PM",
    activity: "Plenary Session - VI",
    details: "Prof. (Dr.) Niru Shamsum Nahar, Ms. Shanti Teresa",
  },
  {
    time: "04:00 PM-04:30 PM",
    activity: "Plenary Session - VII",
    details: "Holographic Demonstration Robotic based simulation skill traning",
  },
  {
    time: "04:30 PM-05:00 PM",
    activity: "Award Ceremony",
    details: "By Honorable Guests",
  },
  {
    time: "05:00 PM-05:15 PM",
    activity: "Vote of Thanks",
    details:
      "Mr. Purushottam Kumbhaj (State President, Nursing Teachers Association, Raj.)",
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

const whyParticipate = [
  "Enhance knowledge and professional skills",
  "Network with national & international experts",
  "Explore innovations in nursing and healthcare",
  "Engage with AI and simulation-based clinical education",
  "Contribute to research & evidence-based nursing practice",
  "Get recognized through prestigious awards",
];

const paperPosterGuidelines = [
  "Participant must be registered for both days of the conference.",
  "Abstracts must be based on original research studies.",
  "Abstracts must be submitted in MS Word with a maximum of 300 words.",
  "Paper presentation must be in 8-10 slides in .pptx format.",
  "Submit abstracts on or before 15 August 2026 by email with subject: Abstract Submission.",
  "Poster presentation flex size is 6x3 ft; bring your own roll-up standee.",
];

export function PageContentClient() {
  const [currentTab, setCurrentTab] = useState<number>(1);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-10">
      <div>
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
      </div>
      <div className="mt-10 mb-12">
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          <div
            className={cn(
              "border-primary cursor-pointer border py-2.5 text-center text-lg font-semibold md:text-xl",
              currentTab === 1 && "text-secondary bg-primary",
            )}
            onClick={() => setCurrentTab(1)}
          >
            Conference Details
          </div>

          <div
            className={cn(
              "border-primary cursor-pointer border py-2.5 text-center text-lg font-semibold md:text-xl",
              currentTab === 2 && "text-secondary bg-primary",
            )}
            onClick={() => setCurrentTab(2)}
          >
            Seminar Speakers
          </div>
          <div
            className={cn(
              "border-primary cursor-pointer border py-2.5 text-center text-lg font-semibold md:text-xl",
              currentTab === 3 && "text-secondary bg-primary",
            )}
            onClick={() => setCurrentTab(3)}
          >
            Jaipur famous Sight seeing
          </div>
        </div>
      </div>
      {currentTab === 1 && <Content />}
      {currentTab === 2 && <SpeakerSection />}
      {currentTab === 3 && <SightSeenJaipur />}
    </div>
  );
}

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
    <div className="mx-auto max-w-5xl">
      <div className="w-full pb-12">
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
    </div>
  );
}

function SightSeenJaipur() {
  const places = [
    {
      name: "Amer Fort",
      image: "/website-image/amber-fort.avif",
    },
    {
      name: "Hawa Mahal",
      image: "/website-image/Hawa_Mahal.avif",
    },
    {
      name: "City Palace",
      image: "/website-image/city_palace.jpg",
    },
    {
      name: "Albert Hall",
      image: "/website-image/albert_hall.jpg",
    },
    {
      name: "Jal Mahal",
      image: "/website-image/Jal_Mahal.avif",
    },
    {
      name: "Nahargarh Fort",
      image: "/website-image/Nahargarh_Fort.webp",
    },
  ];

  return (
    <section className="pb-10">
      <div className="text-center">
        <p className="text-primary text-sm font-semibold uppercase">
          Explore Jaipur
        </p>
        <h3 className="mt-2 text-2xl font-semibold">
          Famous Sightseeing Places in Jaipur
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-700">
          Make the most of your visit to the Pink City with these popular
          heritage and cultural around Jaipur.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {places.map((place, index) => (
          <motion.article
            custom={index}
            initial="hidden"
            key={place.name}
            variants={cardReveal}
            viewport={{ once: true, amount: 0.2 }}
            whileInView="visible"
          >
            <div className="flex items-start gap-3">
              <div>
                <Image
                  width={600}
                  height={600}
                  src={`https://d2c3lsl35lix55.cloudfront.net${place.image}`}
                  alt={place.name}
                  className="mt-2 h-72 w-full overflow-hidden object-cover text-sm leading-6 text-slate-700"
                />
                <h4 className="mt-1 text-lg font-medium text-slate-950">
                  {place.name}
                </h4>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function SpeakerSection() {
  const speakers = [
    {
      name: "Prof. (Dr.) Farukh Khan",
      designation: "National President of NTAI",
      image: "/website-image/faruk+khan.png",
    },
    {
      name: "Prof. (Dr.) Radha Saini",
      designation: "Consultant, World Health Organization, Italy",
      image: "/website-image/radha+saini.png",
    },
    {
      name: "Mr. Anesh Kumar Saini",
      designation: "Faculty, Govt. CON, Jaipur",
      image: "/website-image/anesh+kumar+saini.png",
    },
    {
      name: "Prof. (Dr.) Manju Chhugani",
      designation: "Dean, Faculty of Nursing, Jamia Hamdard, New Delhi",
      image: "/website-image/prof dr.+manju+chhugani.png",
    },
    {
      name: "Dr. Suresh Kumar Sharma",
      designation: "Clinical and Nursing Informatics Specialist, CDAC, Pune",
      image: "/website-image/suresh+kumar.png",
    },
    {
      name: "Mrs. Rinki Dang",
      designation: "National President, All India Govt. Nurses Federation",
      image: "/website-image/rinki+dang.png",
    },
    {
      name: "Prof. R.K. Saini",
      designation: "Principal Nursing, NIMS University",
      image: "/website-image/rk+saini.png",
    },
    {
      name: "Prof. (Dr.) Sukhpal Kaur",
      designation: "Principal, NINE, PGIMER, Chandigarh",
      image: "/website-image/sukhpal+kaur.png",
    },
    {
      name: "Mr. Ghanshyam Jangid",
      designation: "Dean, Faculty of Nursing, RUHS, Jaipur",
      image: "/website-image/ghanshyam+jangid.png",
    },
    {
      name: "Prof. (Dr.) Meryem Yavuz",
      designation:
        "President, International Federation of Perioperative Nurses, Ege University, Izmir, Turkey",
      image: "/website-image/meryem+yavuz.png",
    },
    {
      name: "Prof. (Dr.) Binu Joe",
      designation: "National President, Nursing Scholar Society",
      image: "/website-image/Binu+Joe.png",
    },
    {
      name: "Prof. (Dr.) I Clement",
      designation:
        "Dean & Professor, St. Benedicts Group of Institution, Bengaluru",
      image: "/website-image/dr+i+clement.png",
    },
    {
      name: "Prof. Dr. Hardeep Kaur",
      designation: "Dean Nursing, Baba Faridkot University",
      image: "/website-image/hardeep+kaur.png",
    },
    {
      name: "Prof. (Dr.) Anjali Vijay Kulthe",
      designation:
        "Nursing Officer, Real Hero of 2008 Terrorist Attack at Bombay, Bharat Bhagya Vidhata",
      image: "/website-image/anjali+vijay.png",
    },
    {
      name: "Ms. Anita K Pawar",
      designation:
        "National General Secretary, All India Govt. Nurses Federation",
      image: "/website-image/anita+pawar.png",
    },
    {
      name: "Prof. (Dr.) Marwa",
      designation: "University of Doha, Qatar",
      image: "/website-image/marwa.png",
    },
    {
      name: "Prof. Himanshu Trivedi",
      designation: "State President, NTAI, Gujarat",
      image: "/website-image/himanshu+trivedi.png",
    },
    {
      name: "Prof. (Dr.) Amandeep Kaur Bajwa",
      designation:
        "Vice Principal Cum Dean Nursing Faculty, Sri Guru Ram Das CON, Vallah, Amritsar, Punjab",
      image: "/website-image/amandeep+kaur.png",
    },
    {
      name: "Prof. (Dr.) Ashok Dhaka Vishnoi",
      designation: "CEO, JINC, Jodhpur",
      image: "/website-image/dhaka1.jpg",
    },
    {
      name: "Prof. S S P Warnakulasuriya",
      designation: "Faculty of Nursing, University of Colombo, Sri Lanka",
      image: "/website-image/ssp+warnakulasuriya.png",
    },
    {
      name: "Prof. Navneeta Khrist",
      designation: "Principal, Arogyam Nursing College, Roorkee, Uttarakhand",
      image: "/website-image/navneeta+khrist.png",
    },
    {
      name: "Prof. (Dr.) Niru Shamsum Nahar",
      designation: "Advisor, Grameen Caledonian College of Nursing, Bangladesh",
      image: "/website-image/niru+nahar.png",
    },
    {
      name: "Ms. Shanti Teresa",
      designation:
        "Sole Padma Shri Awardee – 2011, Andaman and Nicobar Islands",
      image: "/website-image/shanti+teresa.png",
    },
    {
      name: "Mr. Purushottam Kumbhaj",
      designation: "State President, Nursing Teachers Association, Rajasthan",
      image: "/website-image/purushottam+kumbhaj.png",
    },
  ];
  const visionaries = [
    {
      name: "Dr. Rahul Sharma",
      designation: `CEO (RH Healthcare Pvt. Ltd, jaipur)`,
      image: "/website-image/rahul+sharma.jpg",
    },
    {
      name: "Mr. Purushottam Kumbhaj",
      designation: "State President (Nursing Teacher Association)",
      image: "/website-image/purushottam+kumbhaj.png",
    },
    {
      name: "Dr. Farukh Khan",
      designation: "National President (Nursing Teacher Association)",
      image: "/website-image/faruk+khan.png",
    },
    {
      name: "Mr. Meghwahan Singh",
      designation: `State President (Rajasthan Rajya Karmchari Mahasangh, BMS)`,
      image: "/website-image/meghwahan+singh.png",
    },
    {
      name: "Mr. Mahesh Kumar Sharma",
      designation: "Former Registrar (Rajasthan Nursing Council)",
      image: "/website-image/mahesh+sharma.png",
    },
    {
      name: "Dr. Vishnu K Swarnkar",
      designation:
        "HOD (Mental Health Nursing) (Upchar College Of Nursing, Jaipur) (State Legal Advisor, NTAI)",
      image: "/website-image/vishnuji1.jpg",
    },
    {
      name: "Dr. Hemlata Sharma",
      designation: `President (INPA Welfare Foundation)`,
      image: "/website-image/dr.+hemlata+sharma.png",
    },
    {
      name: "Dr. Manoj Kumar Sharma",
      designation: "Sr. State Vice President (NTAI, Rajasthan)",
      image: "/website-image/manoj+kumar.png",
    },
    {
      name: "Prof. Minakshi Sharma",
      designation: "Principal (Liberty College Of Nursing, Jaipur)",
      image: "/website-image/menakshi+sharma1.png",
    },
  ];
  return (
    <div>
      <div>
        <h3 className="mb-6 pb-4 text-center text-2xl font-semibold">
          Speakers
        </h3>
        <div className="mb-10 grid w-full grid-cols-2 gap-4 md:grid-cols-3">
          {speakers.map((speaker, index) => (
            <ImageCard index={index} key={speaker.name} {...speaker} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-6 py-4 text-center text-2xl font-semibold">
          The Visionaries
        </h3>
        <div className="mb-10 grid w-full grid-cols-2 gap-4 md:grid-cols-3">
          {visionaries.map((visionary, index) => (
            <ImageCard index={index} key={visionary.name} {...visionary} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageCard({
  name,
  image,
  designation,
  index,
}: {
  name: string;
  image: string;
  designation: string;
  index: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      custom={index}
      initial="hidden"
      variants={cardReveal}
      viewport={{ once: true, amount: 0.2 }}
      whileInView="visible"
    >
      <Image
        height={350}
        width={350}
        src={`https://d2c3lsl35lix55.cloudfront.net${image}`}
        alt={name}
        className="border-primary size-32 overflow-hidden rounded-full border-2 object-contain md:size-48"
      />
      <div className="text-center">
        <h3 className="font-semibold md:text-xl">{name}</h3>
        <p className="text-xs text-slate-700 md:text-sm">{designation}</p>
      </div>
    </motion.div>
  );
}
