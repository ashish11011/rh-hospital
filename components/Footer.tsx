// Footer.tsx

import { IconBrandFacebook, IconBrandLinkedin, IconBrandYoutube } from "@tabler/icons-react";
import { ArrowRight, X } from "lucide-react";


const footerLinks = [
    {
        title: "Corporate",
        links: ["Careers", "Contact Us", "Certifications", "Workshops"],
    },
    {
        title: "Products",
        links: [
            "Medical model",
            "Knee joint model",
            "CPR Training manikins",
            "Male Reproductive System",
            "Child CPR Training Manikins",
            "Fetus Model",
            "Nerveous System Imperted",
        ],
    },
    {
        title: "Courses",
        links: [
            "Basic Nursing Skills",
            "Intermediate Nursing Skills",
            "Advanced Nursing Skills"
        ],
    },
    {
        title: "About",
        links: ["Company about", "Vision & Mission", "Why us?", "Testimonials"],
    },
];

export default function Footer() {
    return (
        <footer className="bg-primary text-white py-6 md:py-10">
            {/* Top CTA */}
            <div className=" container">
                <div className="text-lg md:text-2xl font-semibold mb-6">
                    Your Health, Its Our Priority
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {["Emergency Call", "Find Doctor", "Generate a query"].map((item) => (
                        <div
                            key={item}
                            className="bg-white text-gray-800 rounded-lg px-4 py-3 flex justify-between items-center shadow-sm"
                        >
                            <span>{item}</span>
                            <ArrowRight className="size-5" />
                        </div>
                    ))}
                </div>


                <hr className="border-white/20 mb-6" />

                {/* Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h3 className="font-semibold mb-3">{section.title}</h3>
                            <ul className="space-y-2 text-sm text-white/80">
                                {section.links.map((link) => (
                                    <li key={link} className="hover:text-white cursor-pointer">
                                        {link}
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
                        <X />
                        <IconBrandFacebook />
                        <IconBrandLinkedin />
                        <IconBrandYoutube />
                    </div>

                    <div className="flex gap-4">
                        <span className="cursor-pointer">Privacy Policy</span>
                        <span className="cursor-pointer">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}