import { Navbar } from "@/components/navbar";
import Header from "@/components/header";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChevronRight, HeartIcon, Microchip, ShieldIcon, User, UserIcon } from "lucide-react";
import { PRODUCT_CATEGORY } from "@/const/product";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { IconAugmentedReality, IconCertificate, IconDeviceHeartMonitor, IconHospital, IconMeeple, IconUserScreen } from "@tabler/icons-react";
import WorkshopFAQ from "@/components/ui/AccordionStudio";

export default function Home() {
  return (
    <>

      <HeroSection />
      <CatalogContainer />
      <div className=" container grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProductCategory />
        <div className=" p-4">
          <img src={"https://5.imimg.com/data5/SELLER/Default/2025/11/558466978/JG/NR/PM/194025138/human-torso-small-23-parts-model-250x250.jpg"} alt="sample image" className=" w-full max-w-80 mx-auto" />
          <p className=" max-w-md text-center text-base md:text-xl font-medium mt-6 mx-auto">Human Torso Small 23 Parts Model
            RH LARNYX MODEL
            Human Trachea Intubation Model With Monitor</p>
        </div>
      </div>
      <WhyChooseRH />
      <WorkshopFAQ className=" py-12 container" />
    </>
  );
}


function HeroSection() {
  return <div className=" bg-secondary w-full min-h-72 md:min-h-96 py-6" >
    <div className="container h-full flex items-center min-h-72 md:min-h-96 justify-between">
      <div className=" max-w-xl space-y-8 h-fit">
        <h3 className=" text-lg md:text-2xl">
          Our Medical Experts are here for you.
        </h3>
        <h1 className=" text-2xl md:text-4xl font-semibold">
          Get quality medical care and treatment with us.
        </h1>

        <h3 className=" text-lg md:text-2xl">
          Find the required doctor and schedule your appointment now.
        </h3>
      </div>
      <div>asdf

      </div>
    </div>
  </div>
}

function CatalogContainer() {
  return (
    <div className=" container max-w-6xl! py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
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
    title: "Participate in exibitions",
    icon: IconUserScreen,
  },
  {
    key: 2,
    title: "Upscale Your Nursing Skills ",
    icon: IconCertificate,
  },
  {
    key: 3,
    title: "Health care machines",
    icon: IconDeviceHeartMonitor,
  },
  {
    key: 4,
    title: "Product Dummies",
    icon: IconMeeple,
  },
]

function CatelogBox({ title, icon: Icon }: { title: string, icon: any }) {
  return <Card className=" ring-primary/60 hover:shadow-xl rounded-md duration-200 cursor-pointer">
    <CardContent className=" flex md:text-center items-center  gap-4 w-full ">
      <Icon className=" text-primary shrink-0 size-6 md:size-10 stroke-1" />
      <p className=" text-sm md:text-lg text-gray-600">{title}</p>
      <div className="hidden sm:block ml-auto bg-primary/30 p-0.5 rounded-full">
        <ChevronRight className="   text-primary size-5  " />
      </div>
    </CardContent>
  </Card>
}

function ProductCategory() {
  return (
    <div className=" py-4">
      <Carousel opts={{ align: "start" }}>
        <CarouselContent>
          <CarouselItem
            key={1}
            className="basis-full"
          >
            <div className=" grid grid-cols-2 gap-4">
              {PRODUCT_CATEGORY.slice(0, 4).map((item) => (
                <ProductCategoryCatelogCard key={item.name} category={item} />))}
            </div>
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
      </Carousel>
    </div>
  )
}

function ProductCategoryCatelogCard({ category }: any) {
  return (
    <div className=" w-full h-full p-1">
      <Card className="w-full h-full hover:shadow-xl duration-200">
        <CardContent className="flex flex-col gap-3 items-center text-center p-4">
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
    title: "Unmatched Care",
    icon: HeartIcon,
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
    <section className=" text-white relative mb-96 sm:mb-60 md:mb-32">
      {/* Top Content */}
      <div className="bg-primary py-12">
        <div className="max-w-6xl px-4  mx-auto grid md:grid-cols-2 gap-6 mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Why Choose Rh healthcare?
          </h2>

          <p className="text-sm md:text-base text-white/90 leading-relaxed">
            Rh healthcare, ranked as the top and Best Hospital in
            Jaipur, India has been serving people with quality
            medical services and empathetic care for the last 34 years. We bring
            you experienced medical and non-medical professionals, advanced
            technology & frontier infrastructure to offer quality clinical
            services, ensuring good health for you and your family.
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
              className=" text-gray-700 rounded-sm py-6"
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