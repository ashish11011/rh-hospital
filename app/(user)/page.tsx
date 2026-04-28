import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ShieldIcon, UserIcon } from "lucide-react";
import { PRODUCT_CATEGORY } from "@/const/product";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { IconAugmentedReality, IconBodyScan, IconCertificate, IconHospital, IconMeeple, IconNumber1 } from "@tabler/icons-react";
import WorkshopFAQ from "@/components/ui/AccordionStudio";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CatalogContainer />
      <div className=" container grid grid-cols-1 md:grid-cols-2 gap-4 py-12">
        <ProductCategory />
        <div className=" p-4">
          <img src={"https://5.imimg.com/data5/SELLER/Default/2025/11/558466978/JG/NR/PM/194025138/human-torso-small-23-parts-model-250x250.jpg"} alt="sample image" className=" w-full max-h-60 object-contain max-w-80 mx-auto" />
          <p className=" max-w-md text-gray-700 text-center text-base md:text-lg font-medium mt-6 mx-auto">Human Torso Small 23 Parts Model
            RH LARNYX MODEL
            Human Trachea Intubation Model With Monitor</p>
        </div>
      </div>
      <HomeProductCrousel />
      <WhyChooseRH />
      <AwardSection />
      <AboutOrg />
      <div className=" container pb-10">
        <div className="mb-8 mt-16">
          <h2 className=" text-xl md:text-3xl font-bold text-primary">Frequently Asked Questions</h2>
          {/* <p className="mt-2 text-base md:text-lg text-gray-600">
            Here are some common questions about our workshops.
          </p> */}
        </div>
        <WorkshopFAQ />
      </div>
    </>
  );
}


function HeroSection() {
  return <div className=" bg-linear-to-r shadow-[inset_0px_6px_14px_0px_#515251] from-primary via-primary to-primary text-white w-full min-h-72 py-3 md:py-6" >
    <div className="container h-full flex flex-col md:flex-row items-center gap-6 min-h-72  justify-between">
      <div className=" max-w-xl text-center md:text-left space-y-3 md:space-y-6 h-fit">
        <h3 className=" text-lg md:text-xl">
          First Simulation Centre in Jaipur, Rajasthan
        </h3>
        <h1 className=" text-2xl md:text-3xl font-semibold">
          First Simulation Centre in Jaipur, Rajasthan
          Empowering Nurses
          Through Clinical Simulation
        </h1>

        <h3 className=" text-base">
          RH Healthcare is Jaipur's first and most advanced simulation-based training centre exclusively focused on BSc Nursing students
        </h3>
      </div>
      <div className="max-w-80 max-h-64 w-full h-full">
        <img src="/group-doctor.png" alt="" className=" object-contain h-auto  w-auto" />
      </div>
    </div>
  </div>
}

function CatalogContainer() {
  return (
    <div className=" container pt-12 max-w-6xl! py-8 grid grid-cols-2 md:grid-cols-3 gap-6">
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
  return <Card className=" py-3 ring-2 ring-primary/60 hover:shadow-xl rounded-md duration-200 cursor-pointer">
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

          <p className="text-sm md:text-base text-white/90 leading-relaxed">
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
  return (
    <div className="select-none  w-full bg-primary/10">
      <div className=" container flex-col md:flex-row justify-between max-w-6xl! flex  gap-8 md:gap-20 items-center ">
        <div className="pt-10 md:pb-10 max-w-xl ">
          <h2 className="text-3xl mb-4 text-primary break-keep font-semibold">
            Certificates
          </h2>
          <p className=" text-sm md:text-base text-gray-600  mb-2">Comprehensive training on standard precautions, transmission-based precautions, hand hygiene, PPE use, healthcare-associated infection (HAI) prevention, and sterile technique in clinical settings.</p>
          <p className=" text-sm md:text-base text-gray-600 mb-2">Intensive training in ICU patient management, ventilator care, hemodynamic monitoring, vasopressor management, sedation assessment, and nursing care of critically ill patients.</p>
          <Button className="p-0 flex gap-1.5 duration-200 cursor-pointer hover:gap-3" variant={"link"}>
            <p>View All</p>
            <ArrowRight />
          </Button>
        </div>
        <img src={"/certificate.svg"} className=" w-full h-full shrink-0 max-h-60 md:max-h-none max-w-60 md:max-w-80 object-contain" />
        {/* <div className=" space-y-12">

          <div className=" w-full flex">
            <Carousel>
              <CarouselContent>
                {
                  CERTIFICATES.map((cert) => {
                    return <CarouselItem className=" basis-1/4">
                      <img src={cert} className=" w-full h-auto max-w-60" />
                    </CarouselItem>
                  })
                }
              </CarouselContent>
              <CarouselNext />
              <CarouselPrevious />
            </Carousel>

          </div>
        </div> */}
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