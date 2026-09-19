// Footer.tsx
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
} from "@tabler/icons-react";
import Link from "next/link";

const footerLinks = [
  {
    title: "Corporate",
    links: [
      { label: "Careers", href: "/careers" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Download certificate", href: "/course-certificate" },
      { label: "Workshops", href: "/workshops" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Workshops",
    links: [
      {
        label: "BIO-SHIELD WORKSHOP",
        href: "/workshops/d3e7ec2d-a91a-42bb-8764-2334aa270e63",
      },
      {
        label: "SIMTECH",
        href: "/workshops/b4f95ab7-9ae7-46f8-8dac-bb6d299b3ec0",
      },
      {
        label: "MEDSAFE",
        href: "/workshops/f3a1ed15-4177-4a90-9f44-ad88a26e787e",
      },
      {
        label: "Immunization",
        href: "/workshops/6cfa3be9-3ed5-46ba-a0c2-bf339d28ff9f",
      },
      {
        label: "RUHS",
        href: "/workshops/5312ccea-2292-4987-aa6d-57f81e040f9c",
      },
      {
        label: "Hybrid Labor",
        href: "/workshops/4c88acec-6c64-4831-91f1-cdc34a1b7a7f",
      },
    ],
  },
  {
    title: "Courses",
    links: [
      {
        label: "NRP (Neonatal Resuscitation Program)",
        href: "/courses/nrp-for-nurses",
      },
      {
        label: "Triage Emergencies",
        href: "/courses/triage-emergencies-for-nurses",
      },
      {
        label: "PALS (Pediatric Advanced Life Support)",
        href: "/courses/pals-for-nurses",
      },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Company about", href: "/about-us" },
      { label: "Vision & Mission", href: "/about-us/#our-aim" },
      { label: "Why us?", href: "/about-us/#our-aim" },
      // { label: "Testimonials", href: "/about-us/#our-aim" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-primary py-6 text-white md:py-10">
      <div className="container">
        {/* CTA */}
        <div className="mb-6 text-lg font-semibold md:text-2xl">
          Empowering Nurses Through Clinical Simulation
        </div>
        <hr className="mb-6 border-white/20" />

        {/* Links */}
        <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 font-semibold">{section.title}</h3>
              <ul className="space-y-2 text-sm text-white">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      prefetch={false}
                      href={link.href}
                      className="transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="mb-6 border-white/20" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-white md:flex-row">
          <p>©2026 RH healthcare Simulation Center. All rights reserved.</p>

          <div className="flex gap-4">
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

          <div className="flex gap-4">
            <Link
              prefetch={false}
              href="/privacy-policy"
              className="hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link prefetch={false} href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
