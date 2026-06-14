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
            // { label: "Certifications", href: "/certifications" },
            { label: "Workshops", href: "/workshops" },
            { label: "Workshop Certificate", href: "/course-certificate" },
        ],
    },
    {
        title: "Workshops",
        links: [
            { label: "BIO-SHIELD WORKSHOP", href: "/workshops/d3e7ec2d-a91a-42bb-8764-2334aa270e63" },
            { label: "SIMTECH", href: "/workshops/b4f95ab7-9ae7-46f8-8dac-bb6d299b3ec0" },
            { label: "MEDSAFE", href: "/workshops/f3a1ed15-4177-4a90-9f44-ad88a26e787e" },
            { label: "Immunization", href: "/workshops/6cfa3be9-3ed5-46ba-a0c2-bf339d28ff9f" },
            { label: "RUHS", href: "/workshops/5312ccea-2292-4987-aa6d-57f81e040f9c" },
            { label: "Hybrid Labor", href: "/workshops/4c88acec-6c64-4831-91f1-cdc34a1b7a7f" },
        ],
    },
    {
        title: "Courses",
        links: [
            { label: "Basic Nursing Skills", href: "/courses/basic" },
            { label: "Intermediate Nursing Skills", href: "/courses/intermediate" },
            { label: "Advanced Nursing Skills", href: "/courses/advanced" },
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
        <footer className="bg-primary text-white py-6 md:py-10">
            <div className="container">

                {/* CTA */}
                <div className="text-lg md:text-2xl font-semibold mb-6">
                    Your Health, Its Our Priority
                </div>

                {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Emergency Call", href: "/emergency" },
                        { label: "Find Doctor", href: "/doctors" },
                        { label: "Generate a query", href: "/contact-us" },
                    ].map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="bg-white text-gray-800 rounded-lg px-4 py-3 flex justify-between items-center shadow-sm hover:shadow-md transition"
                        >
                            <span>{item.label}</span>
                            <ArrowRight className="size-5" />
                        </a>
                    ))}
                </div> */}

                <hr className="border-white/20 mb-6" />

                {/* Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h3 className="font-semibold mb-3">{section.title}</h3>
                            <ul className="space-y-2 text-sm text-white/80">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="hover:text-white transition"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <hr className="border-white/20 mb-6" />

                {/* Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/70">
                    <p>©2026 RH healthcare Simulation Center. All rights reserved.</p>

                    <div className="flex gap-4">

                        <Link target="_blank" href={"https://www.facebook.com/rhhealthcaresimulationcenter/"}>
                            <IconBrandFacebook />
                        </Link>
                        <Link target="_blank" href={"https://www.instagram.com/rhhealthcare_in/"}>
                            <IconBrandInstagram />
                        </Link>
                        <Link target="_blank" href={"https://www.youtube.com/@RHHealthcareINDIA"}>
                            <IconBrandYoutube />
                        </Link>
                    </div>

                    <div className="flex gap-4">
                        <a href="/privacy-policy" className="hover:text-white">
                            Privacy Policy
                        </a>
                        <a href="/terms" className="hover:text-white">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}