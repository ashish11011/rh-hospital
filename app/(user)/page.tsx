import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowRightCircle, Award, BadgeCheck, BriefcaseMedical, ChevronRight, Clock, Globe2, PlayCircleIcon, ShieldIcon, UserIcon } from "lucide-react";
import { PRODUCT_CATEGORY } from "@/const/product";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CertificateDialogButton } from "@/components/certificate-dialog-button";
import { IconAugmentedReality, IconBodyScan, IconCertificate, IconHospital, IconMeeple, IconNumber1 } from "@tabler/icons-react";
import WorkshopFAQ from "@/components/ui/AccordionStudio";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: {
    default:
      "RH Healthcare Pvt. Ltd. – Medical Simulators, Workshops & Healthcare Products",
    template:
      "%s | RH Healthcare Pvt. Ltd.",
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
    title:
      "RH Healthcare Pvt. Ltd. – Medical Simulators & Healthcare Training",
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
    title:
      "RH Healthcare Pvt. Ltd. – Medical Simulators & Healthcare Products",
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
      <CertifiedModules />
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
      <div className=" py-12 pb-24 flex flex-col md:flex-row gap-6 container">
        <iframe width="345" height="315" src="https://www.youtube.com/embed/PQ6HXDK8Tk0?si=l3n9p1hwTqgKZbil" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        <iframe width="345" height="315" src="https://www.youtube.com/embed/DwhQItB8u4A?si=Xz06OpAzQvQ11txR" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        <iframe width="345" height="315" src="https://www.youtube.com/embed/rCLVwwpdZhk?si=WebusDPN89sH0Qbh" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
      </div>
      {/* <HomeProductCrousel /> */}

      <AwardSection />
      <AboutOrg />
      <div className="h-12"></div>
      <CTASection />
      <div className=" container pb-10">
        <div className="mb-8 mt-16">
          <h2 className=" text-xl md:text-3xl font-bold text-primary">Frequently Asked Questions</h2>
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
  return <div className=" py-16  w-full min-h-72 md:py-16" >
    <div className="container h-full flex flex-col md:flex-row items-center gap-6 min-h-72  justify-between">
      <div className=" max-w-xl text-center md:text-left space-y-3 md:space-y-6 h-fit">
        <Badge className="">
          First Simulation Centre in Jaipur, Rajasthan
        </Badge>
        <h1 className=" text-2xl md:text-4xl font-semibold">
          Empowering Nurses <br /> Through Clinical Simulation
        </h1>

        <h3 className="">
          RH Healthcare is Jaipur's first and most advanced simulation-based training centre exclusively focused on BSc Nursing students
        </h3>
        <div className=" flex gap-4 items-center  flex-col md:flex-row">
          <Button size={"lg"} className=" w-full md:w-auto rounded-sm" >View Workshops <ArrowRight /> </Button>
          <Button size={"lg"} className=" w-full md:w-auto rounded-sm" variant={"outline"} > Browse Catalogue </Button>
        </div>
      </div>
      <div className="max-w-80 hidden md:block max-h-64 w-full h-full">
        <Image src="/group-doctor.png" alt="group-doctor" width={500} height={500} className=" object-contain h-auto  w-auto" />
      </div>
    </div>
  </div>
}

function CurrentWorkshop() {
  return <div className=" w-full container py-12">
    <div className="grid grid-cols-1 md:grid-cols-2 bg-primary/10 rounded-xl overflow-hidden ">
      <div className="">
        <Image src={"https://d2c3lsl35lix55.cloudfront.net/bioshild-ws.jpeg"} alt="current-workshop" height={800} width={800} className=" w-full h-full object-cover" />
      </div>
      <div className=" p-8 md:p-12 flex flex-col gap-8">
        <h2 className=" text-xl md:text-3xl font-bold text-primary">BIO-SHIELD WORKSHOP</h2>
        <p className=" flex flex-col gap-1">
          <span>📅 Date: 27 June 2026</span>
          <span>⏰ Time: 9:30 AM – 4:00 PM</span>
          <span>📍 Venue: RH Healthcare Simulation Center, Triveni Nagar Chouraha, Gopalpura Bypass, Jaipur</span>
          <span>📘 Mode: Offline and Online</span>
        </p>
        <p className="mt-2  text-gray-600">
          This workshop is a specialized infection control training program designed for healthcare professionals and students. Participants will gain practical knowledge of hand hygiene, PPE usage, biomedical waste management, while earning a Certificate of Participation and 5 Credit Hours.
        </p>
        <Button size={"lg"}>Reserve your seat now</Button>
      </div>
    </div>

  </div>
}

function CertifiedModules() {
  return (
    <div className=" container pt-8">
      <div className=" flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className=" space-y-2">
          <h3 className=" text-lg md:text-2xl font-semibold">Certified Online Modules</h3>
          <p className=" text-sm md:text-base">Self-paced learning modules designed by clinicians for clinicians.</p>
        </div>
        <Button variant={"link"}> View All Modules <ArrowRight /> </Button>
      </div>
      <div className=" mt-12">
        <div className=" w-full grid grid-cols-1 md:grid-cols-3 gap-6 ">
          {
            [1, 2, 3].map((item) => (
              <div key={item} className=" flex flex-col border group cursor-pointer rounded-2xl overflow-hidden h-full">
                <Image src={"https://d2c3lsl35lix55.cloudfront.net/course-tmn.jpg"} height={200} width={200} alt="sample image" className=" group-hover:scale-105 duration-300 transition-all w-full h-full object-contain" />
                <div className=" p-4 flex flex-col gap-2">
                  <p className=" text-lg font-semibold">Fundamentals of IV Cannulation</p>
                  <div className=" flex items-center gap-4 text-sm">
                    <p className="flex items-center gap-1">
                      <Clock size={14} />
                      12 hrs
                    </p>
                    <p className="flex items-center gap-1">
                      <PlayCircleIcon size={14} />
                      24 video lessons
                    </p>
                  </div>
                  <Separator className=" mt-1 w-full h-0.5" />
                  <div className=" mt-3 flex items-center justify-between">
                    <p className=" text-primary font-semibold">CME Accredited</p>
                    <p className=" p-1 bg-gray-200 rounded-full">
                      <ChevronRight size={14} />
                    </p>
                  </div>
                </div>
              </div>))
          }
        </div>
      </div>

    </div>
  )
}

function CTASection() {
  return (
    <div className=" container py-12">
      <div className="rounded-2xl overflow-hidden w-full h-full space-y-5 bg-primary p-10 md:p-12 ">
        <h3 className=" text-2xl md:text-3xl font-semibold text-white text-center">
          Ready to Advance Your Healthcare Career?
        </h3>
        <p className=" text-gray-100 text-sm text-center mt-2">Join our next batch of clinicians and get certified in the most in-demand medical skills.</p>
        <div className=" flex items-center flex-col md:flex-row gap-4 justify-center">
          <Button size={"lg"} variant={"secondary"} className=" w-full md:w-auto  rounded-sm"> Enrol Now <ArrowRight /> </Button>
          <Button size={"lg"} variant={"outline"} className=" bg-primary text-white hover:bg-primary/90 w-full md:w-auto rounded-sm"> Speak to an Advicer <ArrowRight /> </Button>
        </div>
      </div>
    </div>
  )
}

function CatalogContainer() {
  return (
    <div className=" container pt-20 max-w-6xl! py-8 grid grid-cols-2 md:grid-cols-3 gap-6">
      {
        CATELOG_ITEMS.map((item) => {
          return <CatelogBox {...item} />
        })
      }
    </div>
  )
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
]

function CatelogBox({ title, icon: Icon }: { title: string, icon: any }) {
  return <Card className=" py-3 ring-2 border border-primary rounded-md duration-200 cursor-pointer">
    <CardContent className=" flex items-center  gap-4 w-full ">
      <Icon className=" text-primary shrink-0 size-6 md:size-10 stroke-[1.5px]" />
      <p className=" text-xs md:text-lg text-gray-600">{title}</p>
      {/* <div className="hidden sm:block ml-auto bg-primary/30 p-0.5 rounded-full">
        <ChevronRight className="   text-primary size-5  " />
      </div> */}
    </CardContent>
  </Card>
}

function ProductCategory() {
  return (
    <div className=" py-4">
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
      <div className=" grid grid-cols-2 gap-4">
        {PRODUCT_CATEGORY.slice(0, 4).map((item) => (
          <ProductCategoryCatelogCard key={item.name} category={item} />))}
      </div>
    </div>
  )
}

function ProductCategoryCatelogCard({ category }: any) {
  return (
    <div className=" w-full h-full p-1">
      <Card className=" w-full h-full hover:shadow-xl duration-200">
        <CardContent className="flex flex-col gap-3 items-center text-center">
          <img
            src={category.image}
            alt={category.name}
            className=" size-20 md:size-32 object-contain"
          />
          <p className=" text-sm md:text-lg font-medium">{category.name}</p>
        </CardContent>
      </Card>
    </div>
  )
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
    <section className=" text-white relative mb-88 sm:mb-60 md:mb-32">
      {/* Top Content */}
      <div className="bg-primary py-12">
        <div className="max-w-6xl px-4  mx-auto grid md:grid-cols-2 gap-6 mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Why Choose Rh healthcare?
          </h2>

          <p className="text-base leading-7 text-white/90">
            RH Healthcare is a premier clinical simulation training centre established to transform nursing education in Rajasthan. We provide hands-on, scenario-based training in a safe, controlled environment that replicates real clinical settings. Our centre is equipped with high-fidelity manikins, task trainers, and advanced simulation equipment to ensure BSc Nursing students develop competency, confidence.
          </p>
        </div>
      </div>


      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 absolute left-1/2 -translate-x-1/2 bottom-[60px] md:bottom-[40px] translate-y-full w-full ">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              className=" text-gray-700 rounded-sm  md:py-6"
            >
              <CardContent className=" flex flex-col items-center justify-center gap-3">
                <Icon className={`size-9 ${item.color}`} />
                <p className=" font-medium text-center">{item.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  )
}

function AwardSection() {

  const Label = ({ text }: { text: string }) => {
    return <p className=" flex text-sm"> <BadgeCheck className=" text-primary mr-2" size={18} /> {text}</p>
  }
  return (
    <div className="select-none  w-full bg-primary/10">
      <div className=" container flex-col md:flex-row justify-between max-w-6xl! flex  gap-8 md:gap-20 items-center pb-10 md:pb-0">
        <div className="pt-10 md:pb-10 max-w-xl flex  flex-col">
          <h2 className="text-3xl mb-4 text-primary break-keep font-semibold">
            Your Certificate Benefits
          </h2>
          <div className="text-base text-gray-600 leading-7 ">
            <p className="mb-2">Comprehensive training on standard precautions, transmission-based precautions, hand hygiene, PPE use, healthcare-associated infection (HAI) prevention, and sterile technique in clinical settings.</p>
            <p className="mb-2">Intensive training in ICU patient management, ventilator care, hemodynamic monitoring, vasopressor management, sedation assessment, and nursing care of critically ill patients.</p>
          </div>

          <Image height={600} width={600} alt="certificate-sample" src={"/certificate.svg"} className="md:hidden mt-6 w-full h-full shrink-0 max-h-60 max-w-60 self-center object-contain" />

          <div className="flex flex-col gap-1 mt-5 mb-6">
            <Label text="QR-Coded Verification System" />
            <Label text="CME Points Eligibility" />
            <Label text="Lifetime Digital Badge" />
          </div>
          <CertificateDialogButton />
        </div>
        <Image height={600} width={600} alt="certificate-sample" src={"/certificate.svg"} className="hidden md:block w-full h-full shrink-0 max-h-none max-w-80 object-contain" />
      </div>
    </div>
  )
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

]

const PRODUCT_CAT = [
  {
    "category": "Medical Models",
    "link": "medical-models.html",
    "image": "https://5.imimg.com/data5/SELLER/Default/2024/9/452377257/PG/FQ/AL/187849559/cpr-training-manikins-250x250.png",
    "items": [
      { "name": "CPR Training Manikins", "link": "medical-models.html#cpr-training-manikins" },
      { "name": "RH Fetal Skull Models", "link": "medical-models.html#rh-fetal-skull-models" },
      { "name": "Intra Uterine Device Insertion Model", "link": "medical-models.html#intra-uterine-device-insertion-model" }
    ]
  },
  {
    "category": "Anatomical Models",
    "link": "anatomical-models.html",
    "image": "https://5.imimg.com/data5/SELLER/Default/2023/9/345969032/QC/CJ/HY/187849559/multifunctional-female-manikin-250x250.jpg",
    "items": [
      { "name": "Multifunctional Female Manikin", "link": "anatomical-models.html#multifunctional-female-manikin" },
      { "name": "Breast Examination Model", "link": "anatomical-models.html#breast-examination-model" },
      { "name": "Human Skin Anatomical Models", "link": "anatomical-models.html#human-skin-anatomical-models" }
    ]
  },
  {
    "category": "Nursing Manikins",
    "link": "nursing-manikins.html",
    "image": "https://5.imimg.com/data5/SELLER/Default/2023/12/372944599/DT/HR/ZK/187849559/multifunctional-child-manikin-250x250.png",
    "items": [
      { "name": "Multifunctional Child Manikin", "link": "nursing-manikins.html#multifunctional-child-manikin" },
      { "name": "PVC Trauma Manikin", "link": "nursing-manikins.html#pvc-trauma-manikin" },
      { "name": "Trachea Intubation Model Without Monitor", "link": "nursing-manikins.html#trachea-intubation-model-without-monitor" }
    ]
  },

  {
    "category": "Medical Equipment",
    "link": "medical-equipment.html",
    "image": "https://5.imimg.com/data5/SELLER/Default/2025/4/502909607/TP/XI/IR/187849559/bmc-y30t-bipap-machine-250x250.jpg",
    "items": [
      { "name": "Bmc Y30t Bipap Machine", "link": "medical-equipment.html#bmc-y30t-bipap-machine" },
      { "name": "RH Nursing Lab Setup", "link": "medical-equipment.html#rh-nursing-lab-setup-best-price-in-india" },
      { "name": "Model Of Teeth", "link": "medical-equipment.html#model-of-teeth" }
    ]
  },
  {
    "category": "Hospital Equipment",
    "link": "hospital-equipment.html",
    "image": "https://5.imimg.com/data5/SELLER/Default/2024/8/441010101/KZ/FS/WT/187849559/infant-radiant-baby-warmer-250x250.jpg",
    "items": [
      { "name": "Infant Radiant Baby Warmer", "link": "hospital-equipment.html#infant-radiant-baby-warmer" },
      { "name": "Contec 3 Para Monitor", "link": "hospital-equipment.html#contec-3-para-monitor" },
      { "name": "5 Para Monitor", "link": "hospital-equipment.html#5-para-monitor" }
    ]
  },
  {
    "category": "Laboratory Equipment",
    "link": "laboratory-equipment.html",
    "image": "https://5.imimg.com/data5/SELLER/Default/2024/5/417698780/TI/HH/ZN/187849559/human-torso-unisex-model-250x250.jpeg",
    "items": [
      { "name": "Human Torso Unisex Model", "link": "laboratory-equipment.html#human-torso-unisex-model" },
      { "name": "Zoology Lab Equipment", "link": "laboratory-equipment.html#zoology-lab-equipment" },
      { "name": "Nursing College Dummy Supplier", "link": "laboratory-equipment.html#nursing-college-dummy-supplier" }
    ]
  },
  {
    "category": "Pharmacy Instruments",
    "link": "pharmacy-instruments.html",
    "image": "https://5.imimg.com/data5/SELLER/PDFImage/2023/9/347441069/GR/KF/PV/187849559/rh-l-1-250x250.png",
    "items": [
      { "name": "Hospital Laboratory Equipment", "link": "pharmacy-instruments.html#hospital-laboratory-equipment" },
      { "name": "Dmlt Lab Equipment", "link": "pharmacy-instruments.html#dmlt-lab-equipment" },
      { "name": "Pharmacy College Lab Equipments", "link": "pharmacy-instruments.html#pharmacy-college-lab-equipments" }
    ]
  },
  {
    "category": "Biological Models",
    "link": "biological-models.html",
    "image": "https://5.imimg.com/data5/SELLER/Default/2026/1/573034989/IQ/QB/DH/187849559/pvc-teeth-model-250x250.png",
    "items": [
      { "name": "PVC Teeth Model", "link": "biological-models.html#pvc-teeth-model" },
      { "name": "Ovary Macroscopic Model", "link": "biological-models.html#ovary-macroscopic-model" },
      { "name": "RHE Heart Model", "link": "biological-models.html#rhe-heart-with-4-detachable-part" }
    ]
  },
  {
    "category": "Hospital Bed",
    "link": "hospital-bed.html",
    "image": "https://5.imimg.com/data5/SELLER/Default/2024/1/379034114/SS/ST/UO/187849559/child-hospital-bed-250x250.jpg",
    "items": [
      { "name": "Child Hospital Bed", "link": "hospital-bed.html#child-hospital-bed" },
      { "name": "I V and Saline Stand", "link": "hospital-bed.html#i-v-and-saline-stand" },
      { "name": "Waiting Chair 3 Seater SS", "link": "hospital-bed.html#waiting-chair-3-seater-ss" }
    ]
  },
  {
    "category": "Human Anatomical Models",
    "link": "human-anatomical-models.html",
    "image": "https://5.imimg.com/data5/SELLER/Default/2024/4/414802039/DC/HU/VF/187849559/human-larynx-model-250x250.jpg",
    "items": [
      { "name": "Human Larynx Model", "link": "human-anatomical-models.html#human-larynx-model" },
      { "name": "Female Urogenital System Models", "link": "human-anatomical-models.html#female-urogenital-system-models" },
      { "name": "Internal Muscles of Organ Human Body Models", "link": "human-anatomical-models.html#internal-muscles-of-organ-human-body-models" }
    ]
  },
]

function HomeProductCrousel() {
  return (
    <div className=" w-full bg-primary/10 py-12">
      <div className=" container space-y-6">
        <div className="">
          <h2 className="text-2xl text-primary break-keep font-semibold">
            World Class Technology
          </h2>
          <p className=" text-gray-600">
            We use the latest technology to provide the best healthcare services.
          </p>
        </div>
        <div className=" hidden md:block w-full">
          <Carousel>
            <CarouselContent className=" p-1">
              {
                PRODUCT_CAT.map((cat) => {
                  return (
                    <CarouselItem key={cat.link} className=" h-fit cursor-pointer group basis-1/5">
                      <Card className=" hover:shadow-lg duration-200">
                        <CardContent className=" items-center flex flex-col gap-4">
                          <img className=" group-hover:scale-110 duration-200 size-32" src={cat.image} />
                          <p className=" text-lg text-center">{cat.category}</p>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  )
                })
              }
            </CarouselContent>
            <CarouselNext />
            <CarouselPrevious />
          </Carousel>
        </div>
        <div className=" grid gap-6 grid-cols-2 md:hidden">
          {
            PRODUCT_CAT.map((cat) => {
              return (
                <div key={cat.link} className=" h-fit cursor-pointer group basis-1/5">
                  <Card className=" h-full hover:shadow-lg duration-200">
                    <CardContent className=" items-center flex flex-col gap-4">
                      <img className=" group-hover:scale-110 duration-200 size-32" src={cat.image} />
                      <p className=" text-sm font-medium text-center">{cat.category}</p>
                    </CardContent>
                  </Card>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

function AboutOrg() {
  return (
    <div>

    </div>
  )
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
                  <div className=" mb-4 md:mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>

                  <h3 className=" mb-2 md:mb-4 text-xl font-semibold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="text-base leading-6 md:leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}