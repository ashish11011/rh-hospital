import CommingSoon from "@/components/CommingSoon";
import CourseOverviewSection from "@/components/course/CourseOverviewSection";
import { Button } from "@/components/ui/button";
import { IconCertificate } from "@tabler/icons-react";
import { FileText, TvMinimalPlay } from "lucide-react";
import { CourseWaitlistDialog } from "@/components/course/CourseWaitlistDialog";
import Image from "next/image";
import { COURSE_DATA } from "@/const/courceData";
import { notFound } from "next/navigation";
import { getS3AssetUrl } from "@/lib/s3Asset";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const course = COURSE_DATA.find((c) => c.slug === `/courses/${slug}`);

  if (!course) {
    notFound();
  }

  return (
    <>
      <Header bannerImage={course.bannerImage} />
      <div className="container flex w-full flex-col-reverse gap-6 md:flex-row">
        <CourseOverviewSection
          courseOverview={course.courseOverview}
          whatYoullLearn={course.whatYoullLearn}
          skillsAcquired={course.skillsAcquired}
          courseCurriculum={course.courseCurriculum}
          certificate={course.certificate}
        />
        <CoursePurchase
          title={course.courseTitle}
          totalHours={course.courseDetails.totalHours}
          amount={course.courseDetails.amount}
        />
      </div>
    </>
  );
}

function Header({ bannerImage }: { bannerImage: string }) {
  return (
    <div className="relative container mx-auto w-full overflow-hidden md:h-120">
      <Image
        alt="course image"
        className="h-auto w-full object-contain md:object-cover"
        src={getS3AssetUrl(bannerImage)}
        height={1200}
        width={1600}
      />
      <div></div>
    </div>
  );
}

function CoursePurchase({
  title,
  totalHours,
  amount,
}: {
  title: string;
  totalHours: string;
  amount: string;
}) {
  const IconText = ({
    title,
    icon,
  }: {
    title: string;
    icon: React.ReactNode;
  }) => {
    return (
      <div className="flex gap-2 text-gray-700">
        <p>{icon}</p>
        <p className="text-sm">{title}</p>
      </div>
    );
  };
  return (
    <>
      <div className="mt-16 h-fit w-full shrink-0 rounded-xl border p-6 md:sticky md:top-24 md:w-80">
        <h3 className="mb-6 text-2xl font-bold">
          {title.replace("Certificate Course in", "")}
        </h3>
        <div className="mb-6 space-y-4">
          <IconText
            title={`Get this course and many more in Nursing and access to ${totalHours} videos sessions`}
            icon={<TvMinimalPlay size={20} />}
          />
          <IconText
            title="Course with documents"
            icon={<FileText size={20} />}
          />
          <IconText
            title="Get certificate for CNE credits"
            icon={<IconCertificate size={20} />}
          />
        </div>
        <CourseWaitlistDialog courseTitle={title} amount={amount} />
      </div>
    </>
  );
}
