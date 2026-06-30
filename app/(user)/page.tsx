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

export default function Home() {
  return (
    <>
      <HeroSection />
      <CurrentWorkshop />
      {/* <CertifiedModules /> */}
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
    </>
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
        <div className="hidden h-full max-h-64 w-full max-w-80 md:block">
          <Image
            src="/group-doctor.png"
            alt="group-doctor"
            width={500}
            height={500}
            className="h-auto w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function CurrentWorkshop() {
  return (
    <div className="container w-full py-12">
      <div className="bg-primary/10 grid grid-cols-1 overflow-hidden rounded-xl md:grid-cols-2">
        <div className="">
          <Image
            src={
              "https://d2c3lsl35lix55.cloudfront.net/globalnursing_sumbit_c.png"
            }
            alt="current-workshop"
            height={800}
            width={800}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-8 p-8 md:p-12">
          <h2 className="text-primary text-xl font-bold md:text-3xl">
            GLOBAL NURSING LEADERSHIP & EDUCATION SUMMIT 2026
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

function CertifiedModules() {
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
        <Button variant={"link"}>
          {" "}
          View All Modules <ArrowRight />{" "}
        </Button>
      </div>
      <div className="mt-12">
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border"
            >
              <Image
                src={"https://d2c3lsl35lix55.cloudfront.net/course-tmn.jpg"}
                height={200}
                width={200}
                alt="sample image"
                className="h-full w-full object-contain transition-all duration-300 group-hover:scale-105"
              />
              <div className="flex flex-col gap-2 p-4">
                <p className="text-lg font-semibold">
                  Fundamentals of IV Cannulation
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <p className="flex items-center gap-1">
                    <Clock size={14} />
                    12 hrs
                  </p>
                  <p className="flex items-center gap-1">
                    <PlayCircleIcon size={14} />
                    24 video lessons
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
            </div>
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
      {CATELOG_ITEMS.map((item) => {
        return <CatelogBox {...item} />;
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

function ProductCategory() {
  return (
    <div className="py-4">
      {/* <Carousel opts={{ align: "start" }}>
        <CarouselContent>
          <CarouselItem
            key={1}
            className="basis-full"
          >
      
          </CarouselItem>
          <CarouselItem
            key={2}
            className="basis-full"
          >
            <div className=" grid grid-cols-2 gap-4">
              {PRODUCT_CATEGORY.slice(4, 8).map((item) => (
                <ProductCategoryCatelogCard key={item.name} category={item} />))}
            </div>
          </CarouselItem>
        </CarouselContent>

        <CarouselPrevious className=" -top-4 left-[100%-4rem] right-12" />
        <CarouselNext className=" -top-4 right-0" />
      </Carousel> */}
      <div className="grid grid-cols-2 gap-4">
        {PRODUCT_CATEGORY.slice(0, 4).map((item) => (
          <ProductCategoryCatelogCard key={item.name} category={item} />
        ))}
      </div>
    </div>
  );
}

function ProductCategoryCatelogCard({ category }: any) {
  return (
    <div className="h-full w-full p-1">
      <Card className="h-full w-full duration-200 hover:shadow-xl">
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <img
            src={category.image}
            alt={category.name}
            className="size-20 object-contain md:size-32"
          />
          <p className="text-sm font-medium md:text-lg">{category.name}</p>
        </CardContent>
      </Card>
    </div>
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

const CERTIFICATES = [
  "/cert1.jpg",
  "/cert2.jpg",
  "/cert3.jpg",
  "/cert4.jpg",
  "/cert5.jpg",
  "/cert6.jpg",
  "/cert7.jpg",
  "/cert8.jpg",
];

const PRODUCT_CAT = [
  {
    category: "Medical Models",
    link: "medical-models.html",
    image:
      "https://5.imimg.com/data5/SELLER/Default/2024/9/452377257/PG/FQ/AL/187849559/cpr-training-manikins-250x250.png",
    items: [
      {
        name: "CPR Training Manikins",
        link: "medical-models.html#cpr-training-manikins",
      },
      {
        name: "RH Fetal Skull Models",
        link: "medical-models.html#rh-fetal-skull-models",
      },
      {
        name: "Intra Uterine Device Insertion Model",
        link: "medical-models.html#intra-uterine-device-insertion-model",
      },
    ],
  },
  {
    category: "Anatomical Models",
    link: "anatomical-models.html",
    image:
      "https://5.imimg.com/data5/SELLER/Default/2023/9/345969032/QC/CJ/HY/187849559/multifunctional-female-manikin-250x250.jpg",
    items: [
      {
        name: "Multifunctional Female Manikin",
        link: "anatomical-models.html#multifunctional-female-manikin",
      },
      {
        name: "Breast Examination Model",
        link: "anatomical-models.html#breast-examination-model",
      },
      {
        name: "Human Skin Anatomical Models",
        link: "anatomical-models.html#human-skin-anatomical-models",
      },
    ],
  },
  {
    category: "Nursing Manikins",
    link: "nursing-manikins.html",
    image:
      "https://5.imimg.com/data5/SELLER/Default/2023/12/372944599/DT/HR/ZK/187849559/multifunctional-child-manikin-250x250.png",
    items: [
      {
        name: "Multifunctional Child Manikin",
        link: "nursing-manikins.html#multifunctional-child-manikin",
      },
      {
        name: "PVC Trauma Manikin",
        link: "nursing-manikins.html#pvc-trauma-manikin",
      },
      {
        name: "Trachea Intubation Model Without Monitor",
        link: "nursing-manikins.html#trachea-intubation-model-without-monitor",
      },
    ],
  },

  {
    category: "Medical Equipment",
    link: "medical-equipment.html",
    image:
      "https://5.imimg.com/data5/SELLER/Default/2025/4/502909607/TP/XI/IR/187849559/bmc-y30t-bipap-machine-250x250.jpg",
    items: [
      {
        name: "Bmc Y30t Bipap Machine",
        link: "medical-equipment.html#bmc-y30t-bipap-machine",
      },
      {
        name: "RH Nursing Lab Setup",
        link: "medical-equipment.html#rh-nursing-lab-setup-best-price-in-india",
      },
      { name: "Model Of Teeth", link: "medical-equipment.html#model-of-teeth" },
    ],
  },
  {
    category: "Hospital Equipment",
    link: "hospital-equipment.html",
    image:
      "https://5.imimg.com/data5/SELLER/Default/2024/8/441010101/KZ/FS/WT/187849559/infant-radiant-baby-warmer-250x250.jpg",
    items: [
      {
        name: "Infant Radiant Baby Warmer",
        link: "hospital-equipment.html#infant-radiant-baby-warmer",
      },
      {
        name: "Contec 3 Para Monitor",
        link: "hospital-equipment.html#contec-3-para-monitor",
      },
      {
        name: "5 Para Monitor",
        link: "hospital-equipment.html#5-para-monitor",
      },
    ],
  },
  {
    category: "Laboratory Equipment",
    link: "laboratory-equipment.html",
    image:
      "https://5.imimg.com/data5/SELLER/Default/2024/5/417698780/TI/HH/ZN/187849559/human-torso-unisex-model-250x250.jpeg",
    items: [
      {
        name: "Human Torso Unisex Model",
        link: "laboratory-equipment.html#human-torso-unisex-model",
      },
      {
        name: "Zoology Lab Equipment",
        link: "laboratory-equipment.html#zoology-lab-equipment",
      },
      {
        name: "Nursing College Dummy Supplier",
        link: "laboratory-equipment.html#nursing-college-dummy-supplier",
      },
    ],
  },
  {
    category: "Pharmacy Instruments",
    link: "pharmacy-instruments.html",
    image:
      "https://5.imimg.com/data5/SELLER/PDFImage/2023/9/347441069/GR/KF/PV/187849559/rh-l-1-250x250.png",
    items: [
      {
        name: "Hospital Laboratory Equipment",
        link: "pharmacy-instruments.html#hospital-laboratory-equipment",
      },
      {
        name: "Dmlt Lab Equipment",
        link: "pharmacy-instruments.html#dmlt-lab-equipment",
      },
      {
        name: "Pharmacy College Lab Equipments",
        link: "pharmacy-instruments.html#pharmacy-college-lab-equipments",
      },
    ],
  },
  {
    category: "Biological Models",
    link: "biological-models.html",
    image:
      "https://5.imimg.com/data5/SELLER/Default/2026/1/573034989/IQ/QB/DH/187849559/pvc-teeth-model-250x250.png",
    items: [
      {
        name: "PVC Teeth Model",
        link: "biological-models.html#pvc-teeth-model",
      },
      {
        name: "Ovary Macroscopic Model",
        link: "biological-models.html#ovary-macroscopic-model",
      },
      {
        name: "RHE Heart Model",
        link: "biological-models.html#rhe-heart-with-4-detachable-part",
      },
    ],
  },
  {
    category: "Hospital Bed",
    link: "hospital-bed.html",
    image:
      "https://5.imimg.com/data5/SELLER/Default/2024/1/379034114/SS/ST/UO/187849559/child-hospital-bed-250x250.jpg",
    items: [
      {
        name: "Child Hospital Bed",
        link: "hospital-bed.html#child-hospital-bed",
      },
      {
        name: "I V and Saline Stand",
        link: "hospital-bed.html#i-v-and-saline-stand",
      },
      {
        name: "Waiting Chair 3 Seater SS",
        link: "hospital-bed.html#waiting-chair-3-seater-ss",
      },
    ],
  },
  {
    category: "Human Anatomical Models",
    link: "human-anatomical-models.html",
    image:
      "https://5.imimg.com/data5/SELLER/Default/2024/4/414802039/DC/HU/VF/187849559/human-larynx-model-250x250.jpg",
    items: [
      {
        name: "Human Larynx Model",
        link: "human-anatomical-models.html#human-larynx-model",
      },
      {
        name: "Female Urogenital System Models",
        link: "human-anatomical-models.html#female-urogenital-system-models",
      },
      {
        name: "Internal Muscles of Organ Human Body Models",
        link: "human-anatomical-models.html#internal-muscles-of-organ-human-body-models",
      },
    ],
  },
];

function HomeProductCrousel() {
  return (
    <div className="bg-primary/10 w-full py-12">
      <div className="container space-y-6">
        <div className="">
          <h2 className="text-primary text-2xl font-semibold break-keep">
            World Class Technology
          </h2>
          <p className="text-gray-600">
            We use the latest technology to provide the best healthcare
            services.
          </p>
        </div>
        <div className="hidden w-full md:block">
          <Carousel>
            <CarouselContent className="p-1">
              {PRODUCT_CAT.map((cat) => {
                return (
                  <CarouselItem
                    key={cat.link}
                    className="group h-fit basis-1/5 cursor-pointer"
                  >
                    <Card className="duration-200 hover:shadow-lg">
                      <CardContent className="flex flex-col items-center gap-4">
                        <img
                          className="size-32 duration-200 group-hover:scale-110"
                          src={cat.image}
                        />
                        <p className="text-center text-lg">{cat.category}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselNext />
            <CarouselPrevious />
          </Carousel>
        </div>
        <div className="grid grid-cols-2 gap-6 md:hidden">
          {PRODUCT_CAT.map((cat) => {
            return (
              <div
                key={cat.link}
                className="group h-fit basis-1/5 cursor-pointer"
              >
                <Card className="h-full duration-200 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center gap-4">
                    <img
                      className="size-32 duration-200 group-hover:scale-110"
                      src={cat.image}
                    />
                    <p className="text-center text-sm font-medium">
                      {cat.category}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
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
