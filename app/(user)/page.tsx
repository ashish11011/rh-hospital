import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Award,
  Calendar,
  BadgeCheck,
  BriefcaseMedical,
  ChevronRight,
  Clock,
  Globe2,
  Mail,
  MapPin,
  Phone,
  PlayCircleIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";
import {
  IconAugmentedReality,
  IconBodyScan,
  IconCertificate,
  IconHospital,
  IconMeeple,
  IconNumber1,
} from "@tabler/icons-react";
import WorkshopFAQ from "@/components/ui/AccordionStudio";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { getFeaturedPublishedBlogs } from "@/lib/blogData";
import { blogPath } from "@/lib/blogUtils";
import { getS3AssetUrl } from "@/lib/s3Asset";
import { getPublicCourses } from "@/actions/courseActions";
import { getWorkshops } from "@/actions/workshopActions";
import { WorkshowListCard } from "@/components/workshop/WorkshowListCard";
import { formatDate } from "@/helper/formatDate";
import SideForm from "@/app/(user)/contact-us/SideForm";
import { RhCardBenefits } from "@/components/id-card/RhCardBenefits";
import { CreateRhCardLink } from "@/components/id-card/CreateRhCardLink";
import { GlobalNursingSummitGallery } from "@/components/GlobalNursingSummitGallery";

export const metadata: Metadata = {
  title: {
    default:
      "RH Healthcare Pvt. Ltd. – Medical Simulators, Workshops & Healthcare Products",
    template: "%s | RH Healthcare Pvt. Ltd.",
  },
  description:
    "RH Healthcare Pvt. Ltd. provides medical simulators, healthcare products, hospital equipment, and professional workshops across India. Explore high-quality training solutions and products.",
  alternates: {
    canonical: "https://www.rhhealthcaresimulation.com", // update if domain differs
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "RH Healthcare Pvt. Ltd. – Medical Simulators & Healthcare Training",
    description:
      "Explore medical simulators, hospital products, and professional healthcare workshops by RH Healthcare Pvt. Ltd.",
    url: "https://www.rhhealthcaresimulation.com",
    siteName: "RH Healthcare Pvt. Ltd.",
    images: [
      {
        url: "https://www.rhhealthcaresimulation.com/logo.png", // replace with actual logo
        width: 512,
        height: 512,
        alt: "RH Healthcare Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RH Healthcare Pvt. Ltd. – Medical Simulators & Healthcare Products",
    description:
      "Discover healthcare products, simulators, and workshops by RH Healthcare Pvt. Ltd.",
    images: [
      "https://www.rhhealthcaresimulation.com/logo.png", // replace with actual logo
    ],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const revalidate = 7200;

export default async function Home() {
  const [featuredBlogs, courses, workshops] = await Promise.all([
    getFeaturedPublishedBlogs(3),
    getPublicCourses(),
    getWorkshops(),
  ]);

  const pastWorkshops = workshops.filter((ws) => ws.isCompleted);

  return (
    <>
      <HeroSection />
      <div className="container pb-12 md:pb-16">
        <RhCardBenefits>
          <CreateRhCardLink />
        </RhCardBenefits>
      </div>
      <GlobalNursingSummitGallery />
      {/* <CurrentWorkshop /> */}
      <CertifiedModules courses={courses} />
      <PastWorkshops workshops={pastWorkshops} />
      {/* <div className=" container grid grid-cols-1 md:grid-cols-2 gap-4 py-12">
        <ProductCategory />
        <div className=" p-4">
          <img src={"https://5.imimg.com/data5/SELLER/Default/2025/11/558466978/JG/NR/PM/194025138/human-torso-small-23-parts-model-250x250.jpg"} alt="sample image" className=" w-full max-h-60 object-contain max-w-80 mx-auto" />
          <p className=" max-w-md text-gray-700 text-center text-base md:text-lg font-medium mt-6 mx-auto">Human Torso Small 23 Parts Model
            RH LARNYX MODEL
            Human Trachea Intubation Model With Monitor</p>
        </div>
      </div> */}
      <MedicalEducation />
      {/* <CatalogContainer /> */}
      <WhyChooseRH />
      <section className="container py-16 md:py-20">
        <div className="mb-10 text-center">
          <Badge
            variant="outline"
            className="mb-3 border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold tracking-wider text-green-700"
          >
            WATCH & LEARN
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Training Videos
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 md:text-base">
            Watch our simulation-based training sessions and workshop
            highlights.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            "https://www.youtube.com/embed/PQ6HXDK8Tk0?si=l3n9p1hwTqgKZbil",
            "https://www.youtube.com/embed/DwhQItB8u4A?si=Xz06OpAzQvQ11txR",
            "https://www.youtube.com/embed/rCLVwwpdZhk?si=WebusDPN89sH0Qbh",
          ].map((src) => (
            <div
              key={src}
              className="aspect-video w-full overflow-hidden rounded-xl shadow-sm"
            >
              <iframe
                className="h-full w-full"
                src={src}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </section>
      {/* <HomeProductCrousel /> */}

      <AwardSection />
      <CTASection />
      <HomeContactSection />
      <section className="container mx-auto py-16 md:py-20">
        <div className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-500 md:text-base">
            Find answers to common questions about our workshops, courses, and
            certifications.
          </p>
        </div>
        <WorkshopFAQ />
      </section>
      <FeaturedBlogs blogs={featuredBlogs} />
    </>
  );
}

type FeaturedBlog = Awaited<
  ReturnType<typeof getFeaturedPublishedBlogs>
>[number];
type HomeCourse = Awaited<ReturnType<typeof getPublicCourses>>[number];

function FeaturedBlogs({ blogs }: { blogs: FeaturedBlog[] }) {
  if (blogs.length === 0) return null;

  return (
    <section className="container py-16 pb-20 md:py-20 md:pb-24">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <Badge variant="secondary">Featured Blogs</Badge>
          <h2 className="text-primary text-xl font-bold md:text-3xl">
            Latest Healthcare Insights
          </h2>
          <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
            Read practical articles from RH Healthcare Simulation Centre on
            nursing education, clinical simulation, and healthcare training.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/blog">
            View all blogs
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {blogs.map((item) => {
          const imageUrl = getS3AssetUrl(
            item.featuredImage || item.bannerImage,
          );

          return (
            <Link
              key={item.id}
              href={blogPath(item.slug)}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={item.title}
                  width={500}
                  height={280}
                  className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-105"
                />
              )}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {item.category && (
                    <Badge variant="secondary">{item.category}</Badge>
                  )}
                  <Badge>Featured</Badge>
                </div>
                <h3 className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-semibold">
                  {item.title}
                </h3>
                {item.shortDescription && (
                  <p className="text-muted-foreground line-clamp-3 text-sm leading-6">
                    {item.shortDescription}
                  </p>
                )}
                <div className="text-primary mt-auto flex items-center justify-between pt-2 text-sm font-medium">
                  <span>Read more</span>
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

type HomeWorkshop = Awaited<ReturnType<typeof getWorkshops>>[number];

function PastWorkshops({ workshops }: { workshops: HomeWorkshop[] }) {
  if (workshops.length === 0) return null;

  return (
    <section className="container py-16 md:py-20">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold tracking-wider text-green-700"
          >
            OUR WORKSHOPS
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Workshops Conducted So Far
          </h2>
          <p className="max-w-2xl text-sm text-slate-500 md:text-base">
            Explore the hands-on training sessions and certification programs
            we've successfully delivered.
          </p>
        </div>
        <Button asChild variant="link">
          <Link href="/workshops">
            View all workshops
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workshops.slice(0, 6).map((ws) => (
          <WorkshowListCard isCompleted={true} key={ws.id} ws={ws} />
        ))}
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <div className="min-h-72 w-full py-16 md:py-20">
      <div className="container flex h-full min-h-72 flex-col items-center justify-between gap-8 md:flex-row">
        <div className="h-fit max-w-xl space-y-3 text-center md:space-y-6 md:text-left">
          <Badge className="">
            First Simulation Centre in Jaipur, Rajasthan
          </Badge>
          <h1 className="text-2xl font-semibold md:text-4xl">
            Empowering Nurses <br /> Through Clinical Simulation
          </h1>

          <h3 className="">
            RH Healthcare is Jaipur's first and most advanced simulation-based
            training centre exclusively focused on BSc Nursing students
          </h3>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <Link className="w-full md:w-auto" href={"/courses"}>
              <Button
                size={"lg"}
                className="w-full min-w-48 rounded-sm md:w-auto"
              >
                View Courses <ArrowRight />{" "}
              </Button>
            </Link>
            <Link className="w-full md:w-auto" href={"/workshops"}>
              <Button
                size={"lg"}
                className="w-full min-w-48 rounded-sm md:w-auto"
                variant={"outline"}
              >
                {" "}
                Browse Workshops{" "}
              </Button>
            </Link>
          </div>
        </div>
        <Image
          src="https://d2c3lsl35lix55.cloudfront.net/website-image/Hero1.png"
          alt="group-doctor"
          width={500}
          height={500}
          className="h-64 w-auto object-contain"
        />
      </div>
    </div>
  );
}

function CurrentWorkshop() {
  return (
    <div className="container w-full py-12">
      <div className="bg-primary/10 grid grid-cols-1 overflow-hidden rounded-xl md:grid-cols-12">
        <div className="col-span-5">
          <Image
            src={
              "https://d2c3lsl35lix55.cloudfront.net/website-image/Registration+Page.png"
            }
            alt="current-workshop"
            height={800}
            width={800}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="col-span-7 flex flex-col gap-8 p-8 md:p-12">
          <h2 className="text-primary text-xl font-bold md:text-3xl">
            GLOBAL NURSING SUMMIT 2026
          </h2>
          <p className="flex flex-col gap-1">
            <span>
              <span className="font-semibold">📅 Date:</span> 5th – 6th
              September 2026 (Saturday & Sunday)
            </span>
            {/* <span>⏰ Time: 9:30 AM – 4:00 PM</span> */}
            <span>
              {" "}
              <span className="font-semibold">📘 Mode:</span> Offline and Online
            </span>

            <span>
              <span className="font-semibold">📍 Venue:</span>
              Rajasthan International Centre (RIC), Jhalana Doongri, Jaipur,
              Rajasthan
            </span>
            <span>
              <span className="font-semibold">🤝 Presented By:</span>
              RH Healthcare Pvt. Ltd. & Nursing Teachers Association of India
              (NTAI)
            </span>

            {/* <span>
              🎉 Special Occasion:Celebrating Teachers' Day – Honoring
              Educators, Inspiring Futures
            </span> */}
          </p>
          <p className="mt-2 text-gray-600">
            Be part of a two-day national gathering dedicated to advancing
            nursing through leadership, education, research, and innovation.
            Connect with experts, earn up to{" "}
            <span className="font-semibold">10 CNE Credit Hours</span>, and gain
            valuable opportunities for learning, professional growth, and
            recognition.
          </p>
          <Link
            className="w-full"
            href={"/rh-healthcare-ntai-conference-ric-jaipur-2026"}
          >
            <Button className="w-full" size={"lg"}>
              Reserve your seat now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function CertifiedModules({ courses }: { courses: HomeCourse[] }) {
  if (courses.length === 0) return null;

  return (
    <div className="container py-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold md:text-2xl">
            Certified Online Modules
          </h3>
          <p className="text-sm md:text-base">
            Self-paced learning modules designed by clinicians for clinicians.
          </p>
        </div>
        <Button variant={"link"} asChild>
          <Link href="/courses">
            View All Modules <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="mt-12">
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {courses.map((course) => (
            <Link
              href={course.path}
              key={course.id}
              className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border"
            >
              <Image
                src={course.bannerImageUrl}
                height={500}
                width={500}
                alt={course.title}
                className="h-fit w-full object-cover transition-all duration-300 group-hover:scale-105"
              />
              <div className="flex flex-col gap-2 p-4">
                <p className="text-lg font-semibold">{course.title}</p>
                <div className="flex items-center gap-4 text-sm">
                  <p className="flex items-center gap-1">
                    <Clock size={14} />
                    {course.courseDuration || `${course.courseHours} hours`}
                  </p>
                  <p className="flex items-center gap-1">
                    <PlayCircleIcon size={14} />
                    {course.totalLectures} video lessons
                  </p>
                </div>
                <Separator className="mt-1 h-0.5 w-full" />
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-primary font-semibold">CME Accredited</p>
                  <p className="rounded-full bg-gray-200 p-1">
                    <ChevronRight size={14} />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CTASection() {
  return (
    <div className="container py-16 md:py-20">
      <div className="bg-primary h-full w-full space-y-5 overflow-hidden rounded-2xl p-10 md:p-14">
        <h3 className="text-center text-2xl font-semibold text-white md:text-3xl">
          Start Your Journey in Clinical Simulation
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-white/90 md:text-base">
          Browse our certified courses and upcoming workshops to build
          real-world clinical skills with hands-on training.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
          <Link className="w-full md:w-auto" href="/courses">
            <Button
              size="lg"
              variant="secondary"
              className="w-full min-w-44 rounded-sm md:w-auto"
            >
              Explore Courses <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link className="w-full md:w-auto" href="/workshops">
            <Button
              size="lg"
              variant="outline"
              className="w-full min-w-44 rounded-sm border-white/30 bg-transparent text-white hover:bg-white/10 md:w-auto"
            >
              Browse Workshops <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function HomeContactSection() {
  return (
    <section className="bg-slate-50 py-16 md:py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge
            variant="outline"
            className="mb-4 border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold tracking-wider text-green-700"
          >
            GET IN TOUCH
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Have a Question? Reach Out to Us
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 md:text-base">
            Whether you need help choosing a course, want workshop details, or
            have a general inquiry — we're here to help.
          </p>
        </div>

        <div className="grid gap-10 rounded-2xl border bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
          {/* Contact info */}
          <div className="flex flex-col justify-center gap-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Contact Information
            </h3>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-xl p-3">
                <Mail className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <a
                  className="text-primary text-sm font-medium"
                  href="mailto:rhhealthcaresimulationcenter@gmail.com"
                >
                  rhhealthcaresimulationcenter@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-xl p-3">
                <Phone className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm font-medium text-slate-900">
                  +91 99289 07780
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-xl p-3">
                <MapPin className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm font-medium text-slate-900">
                  18-Shakti Nagar, Gopalpura Bypass Road, near Triveni Nagar
                  Chouraha, Jaipur (Raj) — 302015
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-xl p-3">
                <Clock className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Working Hours</p>
                <p className="text-sm font-medium text-slate-900">
                  Mon – Sat: 9:00 AM – 6:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <SideForm />
        </div>
      </div>
    </section>
  );
}

function CatalogContainer() {
  return (
    <div className="container grid max-w-6xl! grid-cols-1 gap-4 py-8 pt-20 sm:grid-cols-2 md:grid-cols-3">
      {CATELOG_ITEMS.map(({ key, ...item }) => {
        return <CatelogBox key={key} {...item} />;
      })}
    </div>
  );
}

const CATELOG_ITEMS = [
  {
    key: 1,
    title: "Simulation Centre in Jaipur dedicated to BSc Nursing",
    icon: IconNumber1,
  },
  {
    key: 2,
    title: "Certificate & Workshop Programs Available",
    icon: IconCertificate,
  },
  {
    key: 3,
    title: "Mandated Module Certified Programs",
    icon: IconMeeple,
  },
];

function CatelogBox({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-lg border border-green-100 bg-green-50/60 px-5 py-6 transition-all duration-300 hover:border-green-200 hover:shadow-md">
      {/* Diagonal lines background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent, transparent 8px, currentColor 8px, currentColor 9px)",
          color: "var(--color-primary, #16a34a)",
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-gray-700 md:text-base">
          {title}
        </p>
        <div className="flex shrink-0 items-center justify-center rounded-md bg-white/80 p-2 shadow-sm ring-1 ring-green-100 transition-transform duration-300 group-hover:scale-110">
          <Icon className="text-primary size-6 stroke-[1.5px] md:size-7" />
        </div>
      </div>
    </div>
  );
}

const whyChooseFeatures = [
  {
    title: "Expert Faculty",
    description:
      "Learn from experienced clinicians and nursing educators with real ICU and hospital experience.",
    icon: UserIcon,
  },
  {
    title: "High-Fidelity Simulators",
    description:
      "Train on advanced manikins and task trainers that replicate real patient scenarios.",
    icon: IconBodyScan,
  },
  {
    title: "Trusted Certifications",
    description:
      "Earn INC-aligned certificates with QR verification, recognised across healthcare institutions.",
    icon: ShieldIcon,
  },
  {
    title: "Latest Technology",
    description:
      "Access cutting-edge simulation equipment and augmented reality tools for immersive learning.",
    icon: IconAugmentedReality,
  },
  {
    title: "Jaipur's First Sim Centre",
    description:
      "Rajasthan's pioneering simulation lab exclusively built for BSc Nursing clinical training.",
    icon: IconHospital,
  },
];

function WhyChooseRH() {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <Badge className="mb-4 border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-white">
            WHY CHOOSE US
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">
            Why Choose RH Healthcare?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
            We are Rajasthan's premier clinical simulation training centre,
            transforming nursing education through hands-on, scenario-based
            training in a safe, controlled environment.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-5">
          {whyChooseFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group rounded-xl bg-white/10 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 md:p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 transition-colors group-hover:bg-white/25">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-white/70">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AwardSection() {
  const Label = ({ text }: { text: string }) => {
    return (
      <p className="flex text-sm">
        {" "}
        <BadgeCheck className="text-primary mr-2" size={18} /> {text}
      </p>
    );
  };
  return (
    <div className="bg-primary/10 w-full select-none">
      <div className="container flex max-w-6xl! flex-col items-center justify-between gap-8 py-16 md:flex-row md:gap-20 md:py-20">
        <div className="flex max-w-xl flex-col">
          <h2 className="text-primary mb-4 text-3xl font-semibold break-keep">
            Your Certificate Benefits
          </h2>
          <div className="text-base leading-7 text-gray-600">
            <p className="mb-2">
              Comprehensive training on standard precautions, transmission-based
              precautions, hand hygiene, PPE use, healthcare-associated
              infection (HAI) prevention, and sterile technique in clinical
              settings.
            </p>
            <p className="mb-2">
              Intensive training in ICU patient management, ventilator care,
              hemodynamic monitoring, vasopressor management, sedation
              assessment, and nursing care of critically ill patients.
            </p>
          </div>

          <Image
            height={600}
            width={600}
            alt="certificate-sample"
            src={"/certificate.svg"}
            className="mt-6 h-full max-h-60 w-full max-w-60 shrink-0 self-center object-contain md:hidden"
          />

          <div className="mt-5 mb-6 flex flex-col gap-1">
            <Label text="QR-Coded Verification System" />
            <Label text="CME Points Eligibility" />
            <Label text="Lifetime Digital Badge" />
          </div>
          {/* <CertificateDialogButton /> */}
        </div>
        <Image
          height={600}
          width={600}
          alt="certificate-sample"
          src={"/certificate.svg"}
          className="hidden h-full max-h-none w-full max-w-80 shrink-0 object-contain md:block"
        />
      </div>
    </div>
  );
}

function MedicalEducation() {
  const features = [
    {
      title: "Experienced Faculty",
      description:
        "Learn from experienced healthcare professionals and educators with real-world clinical expertise.",
      icon: Award,
    },
    {
      title: "Practical Learning",
      description:
        "Build confidence through hands-on workshops, simulation-based training, and case-based learning.",
      icon: BriefcaseMedical,
    },
    {
      title: "Recognized Certification",
      description:
        "Earn certificates that showcase your learning and support your professional development.",
      icon: Globe2,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-green-50/50 to-white py-20 md:py-28">
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-green-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-green-100/30 blur-3xl" />

      <div className="relative container mx-auto max-w-6xl px-4">
        {/* Section label */}
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <Badge
            variant="outline"
            className="mb-4 border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold tracking-wider text-green-700"
          >
            WHY RH HEALTHCARE
          </Badge>

          <h2 className="text-2xl leading-tight font-bold tracking-tight text-slate-900 md:text-4xl lg:text-[2.75rem]">
            Why Learn with <span className="text-primary">RH Healthcare?</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500 md:mt-5 md:text-base">
            Advance your healthcare career through expert-led courses, practical
            workshops, and industry-focused training designed to strengthen your
            clinical knowledge and professional skills.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-slate-100 bg-white px-6 py-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg md:px-7 md:py-10"
              >
                {/* Green accent bar */}
                <div className="bg-primary absolute top-6 left-0 h-10 w-1 rounded-r-full opacity-60 transition-all duration-300 group-hover:h-14 group-hover:opacity-100" />

                {/* Step number */}
                <span className="mb-4 inline-block text-xs font-bold tracking-widest text-slate-300">
                  0{index + 1}
                </span>

                <div className="bg-primary/10 group-hover:bg-primary/20 mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300">
                  <Icon className="text-primary h-6 w-6" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>

                <p className="text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center md:mt-16">
          <Link href="/courses">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full px-8 text-white shadow-md transition-shadow hover:shadow-lg"
            >
              Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
