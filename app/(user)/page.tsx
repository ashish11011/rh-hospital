import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ArrowRightCircle,
  Award,
  BadgeCheck,
  BriefcaseMedical,
  ChevronRight,
  Clock,
  Globe2,
  PlayCircleIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";
import { PRODUCT_CATEGORY } from "@/const/product";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CertificateDialogButton } from "@/components/certificate-dialog-button";
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
  const [featuredBlogs, courses] = await Promise.all([
    getFeaturedPublishedBlogs(3),
    getPublicCourses(),
  ]);

  return (
    <>
      <HeroSection />
      <CurrentWorkshop />
      <CertifiedModules courses={courses} />
      <CatalogContainer />
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
      <WhyChooseRH />
      <div className="container flex flex-col gap-6 py-12 pb-24 md:flex-row">
        <iframe
          width="345"
          height="315"
          src="https://www.youtube.com/embed/PQ6HXDK8Tk0?si=l3n9p1hwTqgKZbil"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
        <iframe
          width="345"
          height="315"
          src="https://www.youtube.com/embed/DwhQItB8u4A?si=Xz06OpAzQvQ11txR"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
        <iframe
          width="345"
          height="315"
          src="https://www.youtube.com/embed/rCLVwwpdZhk?si=WebusDPN89sH0Qbh"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
      {/* <HomeProductCrousel /> */}

      <AwardSection />
      <AboutOrg />
      <div className="h-12"></div>
      <CTASection />
      <div className="container pb-10">
        <div className="mt-16 mb-8">
          <h2 className="text-primary text-xl font-bold md:text-3xl">
            Frequently Asked Questions
          </h2>
          {/* <p className="mt-2 text-base md:text-lg text-gray-600">
            Here are some common questions about our workshops.
          </p> */}
        </div>
        <WorkshopFAQ />
        <div className="h-10"></div>
      </div>
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
    <section className="container py-12">
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

function HeroSection() {
  return (
    <div className="min-h-72 w-full py-16 md:py-16">
      <div className="container flex h-full min-h-72 flex-col items-center justify-between gap-6 md:flex-row">
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
            <Link className="w-full md:w-auto" href={"/workshops"}>
              <Button size={"lg"} className="w-full rounded-sm md:w-auto">
                View Workshops <ArrowRight />{" "}
              </Button>
            </Link>
            <Link
              className="w-full md:w-auto"
              href={"/rh-healthcare-ntai-conference-ric-jaipur-2026"}
            >
              <Button
                size={"lg"}
                className="w-full rounded-sm md:w-auto"
                variant={"outline"}
              >
                {" "}
                Browse Conference{" "}
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
    <div className="container pt-8">
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
                className="h-full w-full object-contain transition-all duration-300 group-hover:scale-105"
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
    <div className="container py-12">
      <div className="bg-primary h-full w-full space-y-5 overflow-hidden rounded-2xl p-10 md:p-12">
        <h3 className="text-center text-2xl font-semibold text-white md:text-3xl">
          Ready to Advance Your Healthcare Career?
        </h3>
        <p className="mt-2 text-center text-sm text-gray-100">
          Join our next batch of clinicians and get certified in the most
          in-demand medical skills.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
          <Link
            className="w-full md:w-auto"
            href={"/rh-healthcare-ntai-conference-ric-jaipur-2026"}
          >
            <Button
              size={"lg"}
              variant={"secondary"}
              className="w-full rounded-sm md:w-auto"
            >
              {" "}
              Enrol Now <ArrowRight />{" "}
            </Button>
          </Link>
          <Link className="w-full md:w-auto" href={"/contact-us"}>
            <Button
              size={"lg"}
              variant={"outline"}
              className="bg-primary hover:bg-primary/90 w-full rounded-sm text-white md:w-auto"
            >
              {" "}
              Speak to an Advicer <ArrowRight />{" "}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function CatalogContainer() {
  return (
    <div className="container grid max-w-6xl! grid-cols-2 gap-6 py-8 pt-20 md:grid-cols-3">
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
    title: "Certificate & Workshop Programs Available ",
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
    <Card className="border-primary cursor-pointer rounded-md border py-3 ring-2 duration-200">
      <CardContent className="flex w-full items-center gap-4">
        <Icon className="text-primary size-6 shrink-0 stroke-[1.5px] md:size-10" />
        <p className="text-xs text-gray-600 md:text-lg">{title}</p>
        {/* <div className="hidden sm:block ml-auto bg-primary/30 p-0.5 rounded-full">
        <ChevronRight className="   text-primary size-5  " />
      </div> */}
      </CardContent>
    </Card>
  );
}

const features = [
  {
    title: "Excellent People",
    icon: UserIcon,
    color: "text-sky-600",
  },
  {
    title: "Simulation Equipment",
    icon: IconBodyScan,
    color: "text-red-500",
  },
  {
    title: "Shield of Trust",
    icon: ShieldIcon,
    color: "text-blue-500",
  },
  {
    title: "World-class Technology",
    icon: IconAugmentedReality,
    color: "text-orange-500",
  },
  {
    title: "Healthcare Hub",
    icon: IconHospital,
    color: "text-lime-600",
  },
];

function WhyChooseRH() {
  return (
    <section className="relative mb-88 text-white sm:mb-60 md:mb-32">
      {/* Top Content */}
      <div className="bg-primary py-12">
        <div className="mx-auto mb-16 grid max-w-6xl gap-6 px-4 md:grid-cols-2">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Why Choose Rh healthcare?
          </h2>

          <p className="text-base leading-7 text-white/90">
            RH Healthcare is a premier clinical simulation training centre
            established to transform nursing education in Rajasthan. We provide
            hands-on, scenario-based training in a safe, controlled environment
            that replicates real clinical settings. Our centre is equipped with
            high-fidelity manikins, task trainers, and advanced simulation
            equipment to ensure BSc Nursing students develop competency,
            confidence.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="absolute bottom-[60px] left-1/2 mx-auto grid w-full max-w-6xl -translate-x-1/2 translate-y-full grid-cols-2 gap-6 px-4 sm:grid-cols-3 md:bottom-[40px] md:grid-cols-5">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="rounded-sm text-gray-700 md:py-6">
              <CardContent className="flex flex-col items-center justify-center gap-3">
                <Icon className={`size-9 ${item.color}`} />
                <p className="text-center font-medium">{item.title}</p>
              </CardContent>
            </Card>
          );
        })}
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
      <div className="container flex max-w-6xl! flex-col items-center justify-between gap-8 pb-10 md:flex-row md:gap-20 md:pb-0">
        <div className="flex max-w-xl flex-col pt-10 md:pb-10">
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
          <CertificateDialogButton />
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

function AboutOrg() {
  return <div></div>;
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
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Why Learn with RH Healthcare?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Advance your healthcare career through expert-led courses, practical
            workshops, and industry-focused training designed to strengthen your
            clinical knowledge and professional skills.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="md:p-8">
                  <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl md:mb-8">
                    <Icon className="text-primary h-7 w-7" />
                  </div>

                  <h3 className="mb-2 text-xl font-semibold text-slate-900 md:mb-4">
                    {feature.title}
                  </h3>

                  <p className="">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
