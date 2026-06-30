import CommingSoon from "@/components/CommingSoon";
import CourseOverviewSection from "@/components/course/CourseOverviewSection";
import { Button } from "@/components/ui/button";
import { IconCertificate } from "@tabler/icons-react";
import { FileText, TvMinimalPlay } from "lucide-react";
import Image from "next/image";

export default function Page() {
    return <>
        <Header />
        <div className=" w-full container flex gap-6 flex-col-reverse md:flex-row">
            <CourseOverviewSection />
            <CoursePurchase />
        </div>
    </>
}

function Header() {
    return (
        <div className=" relative h-120 w-full">
            <Image alt="course image" className=" object-cover h-120 w-full" src={"https://d2c3lsl35lix55.cloudfront.net/course-tmn.jpg"} height={1200} width={1600} />
            <div></div>
        </div>
    )
}

function CoursePurchase() {
    const IconText = ({ title, icon }: { title: string, icon: React.ReactNode }) => {
        return (
            <div className=" flex gap-2 text-gray-700">
                <p>{icon}</p>
                <p className=" text-sm">{title}</p>
            </div>
        )
    }
    return (
        <>
            <div className=" w-full md:w-2xl h-fit md:sticky md:top-24 rounded-xl mt-16 border p-6">
                <h3 className=" text-2xl font-bold mb-6">Advanced ECG Interpretation</h3>
                <div className=" mb-6 space-y-4">
                    <IconText title="Get this course and many more in Nursing and access to 280+ hours vieos sessions" icon={<TvMinimalPlay size={20} />} />
                    <IconText title="Course with documents" icon={<FileText size={20} />} />
                    <IconText title="Get certificate for 5 CNE credits" icon={<IconCertificate size={20} />} />
                </div>
                <Button className=" w-full" size={"lg"}>Buy now</Button>
            </div>
        </>
    )
}