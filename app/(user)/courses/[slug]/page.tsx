import { auth } from "@/auth";
import {
  getCourseEnrolmentStatus,
  getCurrentCourseUser,
  getPublicCourseBySlug,
} from "@/actions/courseActions";
import { CoursePurchaseButton } from "@/components/course/CoursePurchaseButton";
import CourseOverviewSection from "@/components/course/CourseOverviewSection";
import { Badge } from "@/components/ui/badge";
import { getApprovedCourseReviews } from "@/lib/courseReviewData";
import { IconCertificate } from "@tabler/icons-react";
import { FileText, IndianRupee, Star, TvMinimalPlay } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cloudfrontAssetUrl } from "@/lib/cloudfront";
import { publicCoursePath } from "@/lib/course";
import { getS3AssetUrl } from "@/lib/s3Asset";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const course = await getPublicCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const session = await auth();
  const currentUser = await getCurrentCourseUser();
  const enrolmentStatus = await getCourseEnrolmentStatus(course.id);
  const coursePath = publicCoursePath(course.slug);
  const reviews = await getApprovedCourseReviews(course.id);

  return (
    <>
      <Header bannerImage={cloudfrontAssetUrl(course.bannerImageUrl)} />
      <div className="container flex w-full flex-col-reverse gap-6 md:flex-row">
        <CourseOverviewSection
          courseOverview={course.courseOverview || course.description}
          whatYoullLearn={course.whatYouWillLearn || []}
          skillsAcquired={course.skillsAcquired || []}
          courseCurriculum={course.items.map((item, index) => ({
            moduleNumber: index + 1,
            lectureName: item.title || `Lesson ${index + 1}`,
            duration: item.duration || "Self paced",
            subTopics: item.mediaType,
          }))}
          certificate={{
            type: "Course completion",
            description:
              course.content ||
              "Validate your expertise with a professional certificate from RH Healthcare Simulation Centre.",
          }}
        />
        <CoursePurchase
          courseId={course.id}
          coursePath={coursePath}
          title={course.title}
          totalHours={course.courseDuration || `${course.courseHours} hours`}
          amount={course.price}
          currency={course.currency || "INR"}
          isLoggedIn={Boolean(session?.user?.email)}
          isEnrolled={enrolmentStatus === "enrolled"}
          enrolmentStatus={enrolmentStatus}
          totalLectures={course.totalLectures}
          user={{
            name: currentUser?.name || session?.user?.name,
            email: currentUser?.email || session?.user?.email,
            contact: currentUser?.mobileNumber,
          }}
        />
      </div>
      <CourseReviews reviews={reviews} />
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
  courseId,
  coursePath,
  title,
  totalHours,
  amount,
  currency,
  isLoggedIn,
  isEnrolled,
  enrolmentStatus,
  totalLectures,
  user,
}: {
  courseId: string;
  coursePath: string;
  title: string;
  totalHours: string;
  amount: number;
  currency: string;
  isLoggedIn: boolean;
  isEnrolled: boolean;
  enrolmentStatus: string | null;
  totalLectures: number;
  user: {
    name?: string | null;
    email?: string | null;
    contact?: string | null;
  };
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
        {enrolmentStatus && (
          <Badge
            className="mb-4 capitalize"
            variant={isEnrolled ? "default" : "secondary"}
          >
            {enrolmentStatus}
          </Badge>
        )}
        <h3 className="mb-6 text-2xl font-bold">
          {title.replace("Certificate Course in", "")}
        </h3>
        <div className="mb-5 flex items-center text-3xl font-bold">
          <IndianRupee className="h-6 w-6" />
          {amount}
        </div>
        <div className="mb-6 space-y-4">
          <IconText
            title={`Access ${totalHours} of course videos and learning material`}
            icon={<TvMinimalPlay size={20} />}
          />
          <IconText
            title={`${totalLectures} course lessons with documents`}
            icon={<FileText size={20} />}
          />
          <IconText
            title="Get certificate for CNE credits"
            icon={<IconCertificate size={20} />}
          />
        </div>
        <CoursePurchaseButton
          courseId={courseId}
          coursePath={coursePath}
          courseTitle={title}
          amount={amount}
          currency={currency}
          isLoggedIn={isLoggedIn}
          isEnrolled={isEnrolled}
          user={user}
        />
      </div>
    </>
  );
}

function CourseReviews({ reviews }: { reviews: Awaited<ReturnType<typeof getApprovedCourseReviews>> }) {
  if (reviews.length === 0) return null;

  const averageRating = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;

  return (
    <section className="container py-12">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student reviews</h2>
          <p className="text-sm text-gray-600">Approved feedback from enrolled learners.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          {averageRating.toFixed(1)} out of 5 from {reviews.length} review{reviews.length === 1 ? "" : "s"}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-lg border p-5">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-current" : ""}`} />
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-700">{review.feedback}</p>
            <div className="mt-4 text-sm">
              <p className="font-semibold">{review.userName}</p>
              <p className="text-gray-500">
                {[review.userDesignation, review.userInstituteName, review.userCity].filter(Boolean).join(", ")}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
