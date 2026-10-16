import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  Eye,
  FlaskConical,
  HeartPulse,
  MapPin,
  Quote,
  Target,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { publicAssetUrl } from "@/lib/publicAsset";
import SidebarForm from "./SidebarForm";

export const metadata = {
  title: "About Us",
  description:
    "Learn about RH Healthcare Pvt. Ltd., our mission, and our work in medical simulators, healthcare products, and training solutions.",
  alternates: { canonical: "https://www.rhhealthcaresimulation.com/about-us" },
};

const expertise = [
  {
    icon: HeartPulse,
    title: "Medical simulation",
    description: "Simulators and skill labs for practical clinical training.",
  },
  {
    icon: FlaskConical,
    title: "Scientific equipment",
    description: "Lab equipment and anatomical models for better learning.",
  },
  {
    icon: BookOpen,
    title: "Healthcare education",
    description: "Training aids and solutions for healthcare institutions.",
  },
  {
    icon: BadgeCheck,
    title: "Hospital solutions",
    description: "Hospital furniture and complete ICU and OT setups.",
  },
];

const mission = [
  "Deliver ISO & CE certified products that meet global quality standards.",
  "Provide end-to-end solutions for colleges, hospitals, and simulation centers.",
  "Bridge the gap between education and real-world healthcare needs through innovation.",
  "Maintain ready stock, fast delivery, and affordable pricing for all clients.",
  "Build long-term relationships with institutions based on trust, service, and growth.",
];

export default function AboutPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="bg-gradient-to-b from-green-50/70 to-white">
        <div className="container pt-12 pb-8 md:pt-16 md:pb-10">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Badge
                variant="outline"
                className="h-auto border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold tracking-wider text-green-700"
              >
                ABOUT RH HEALTHCARE
              </Badge>
              <h1 className="mt-5 text-3xl leading-tight font-bold tracking-tight md:text-4xl lg:text-5xl">
                Better training.
                <br />
                <span className="text-primary">Better healthcare.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
                Connecting healthcare education with real-world practice through
                quality equipment, medical simulation, and hands-on learning.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-11 px-6">
                  <Link href="/contact-us">
                    Get in touch <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 px-6"
                >
                  <a href="#our-story">
                    Our story <ArrowDown aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>
            {/* <figure className="overflow-hidden rounded-2xl border border-green-100 bg-green-50">
              <div className="relative aspect-[4/3]">
                <Image
                  src={publicAssetUrl("website-image/rh-building.webp")}
                  alt="RH Healthcare Simulation Centre building in Jaipur"
                  fill
                  preload
                  sizes="(min-width: 1152px) 512px, (min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="flex items-center gap-3 bg-white px-5 py-4">
                <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Rooted in Jaipur</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Supporting healthcare institutions across India
                  </p>
                </div>
              </figcaption>
            </figure> */}
          </div>
          <div className="mt-10 grid gap-5 border-t border-slate-100 pt-7 sm:grid-cols-3 md:mt-14">
            {[
              {
                icon: BadgeCheck,
                title: "ISO & CE certified",
                text: "Quality you can trust",
              },
              {
                icon: HeartPulse,
                title: "Education to patient care",
                text: "Complete healthcare solutions",
              },
              {
                icon: Truck,
                title: "Nationwide support",
                text: "Ready stock and reliable delivery",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3">
                <Icon
                  className="text-primary size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container grid items-start gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
        <div className="min-w-0 space-y-14 md:space-y-16">
          <section
            id="our-story"
            aria-labelledby="story-heading"
            className="scroll-mt-24"
          >
            <p className="text-primary text-xs font-semibold tracking-wider uppercase">
              Our story
            </p>
            <h2
              id="story-heading"
              className="mt-3 text-2xl font-bold tracking-tight md:text-3xl"
            >
              A partner in learning. A partner in care.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 md:text-base">
              <p>
                RH Healthcare Pvt. Ltd. is one of India’s trusted names in
                scientific lab equipment, hospital furniture, medical
                simulators, and educational training aids. Based in Jaipur,
                Rajasthan, we are ISO & CE certified and dedicated to delivering
                world-class healthcare and education solutions.
              </p>
              <p>
                We serve nursing, paramedical, pharmacy, ayurveda, and medical
                colleges, as well as hospitals, clinics, and diagnostic centers.
                Our goal is to provide innovative, reliable, and affordable
                products that enhance both practical training and patient care.
              </p>
              <p>
                With a robust supply chain, ready stock, fast delivery, and
                nationwide service, we build long-lasting relationships with
                institutions across India. From anatomical models to complete
                ICU & OT setups, we offer end-to-end solutions for education and
                healthcare.
              </p>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {expertise.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-5"
                >
                  <Icon
                    className="text-primary mb-3 size-6"
                    aria-hidden="true"
                  />
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="founder-heading"
            className="overflow-hidden rounded-2xl border border-green-100 bg-green-50/60"
          >
            <div className="border-b border-green-100 p-6 sm:p-8">
              <p className="text-primary text-xs font-semibold tracking-wider uppercase">
                Founder & CEO
              </p>
              <h2
                id="founder-heading"
                className="mt-3 text-2xl font-bold tracking-tight md:text-3xl"
              >
                Dr. Rahul Sharma
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                RH Healthcare Pvt. Ltd.
              </p>
              <blockquote className="mt-6 flex gap-3">
                <Quote
                  className="text-primary mt-1 size-6 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-lg leading-relaxed font-medium text-green-900">
                  To empower the next generation of healthcare professionals
                  with the right tools, training, and technology.
                </p>
              </blockquote>
            </div>
            <div className="space-y-4 bg-white p-6 text-sm leading-7 text-slate-600 sm:p-8 md:text-base">
              <p>
                A visionary entrepreneur and healthcare education leader, Dr.
                Sharma brings deep expertise in nursing, paramedical, and
                medical training systems. He has dedicated his career to
                bridging the gap between education and industry requirements.
              </p>
              <p>
                Under his leadership, RH Healthcare has grown from a medical
                equipment supplier into a comprehensive healthcare and education
                solutions provider. His initiatives include the RH Simulation
                Center, an advanced skill lab that prepares students for
                real-world medical challenges.
              </p>
              <p>
                He is also actively engaged in nursing and paramedical advocacy,
                consultancy for setting up new colleges, and promoting quality
                education through associations like RAHEA and NTAI.
              </p>
            </div>
          </section>

          <section
            id="our-aim"
            aria-labelledby="purpose-heading"
            className="scroll-mt-24"
          >
            <p className="text-primary text-xs font-semibold tracking-wider uppercase">
              Our purpose
            </p>
            <h2
              id="purpose-heading"
              className="mt-3 text-2xl font-bold tracking-tight md:text-3xl"
            >
              Working towards a healthier future
            </h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 p-6">
                <span className="bg-primary/10 text-primary mb-4 flex size-11 items-center justify-center rounded-xl">
                  <Target className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold">Our Aim</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  To become a trusted partner for healthcare and education
                  institutions by providing world-class equipment, innovative
                  solutions, and reliable services that improve both practical
                  training and patient care.
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-6">
                <span className="bg-primary/10 text-primary mb-4 flex size-11 items-center justify-center rounded-xl">
                  <Eye className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold">Our Vision</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  To be recognized as India’s leading healthcare and education
                  solution provider, empowering nursing, paramedical, pharmacy,
                  and medical professionals with advanced tools, technologies,
                  and training facilities that shape a healthier future.
                </p>
              </div>
            </div>
            <div className="mt-7">
              <h3 className="text-lg font-semibold">Our Mission</h3>
              <ul className="mt-4 space-y-4">
                {mission.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-slate-600"
                  >
                    <span className="bg-primary/10 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
        <SidebarForm />
      </div>

      <section
        className="container pb-16 md:pb-20"
        aria-labelledby="explore-heading"
      >
        <div className="bg-primary flex flex-col items-start justify-between gap-6 rounded-2xl p-7 sm:p-10 md:flex-row md:items-center md:p-12">
          <div className="max-w-xl">
            <h2
              id="explore-heading"
              className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
            >
              Build your next chapter in healthcare
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/90 md:text-base">
              Explore our courses and hands-on workshops to strengthen your
              clinical knowledge and practical skills.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-11 w-full px-6 sm:w-auto"
          >
            <Link href="/courses">
              Explore courses <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
