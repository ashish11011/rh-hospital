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
import { Clock3, FileText, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cloudfrontAssetUrl } from "@/lib/cloudfront";
import { publicCoursePath } from "@/lib/course";
import { getS3AssetUrl } from "@/lib/s3Asset";
import Link from "next/link";
import { CoursePrice } from "@/components/course/CoursePrice";
import { RH_CARD_DISCOUNT_PERCENT } from "@/lib/constants";
import {
  getRhCardCoursePricing,
  type CoursePricing,
} from "@/lib/rhCardDiscount";
import { getRhCardDiscountCard } from "@/lib/rhCardMembership";

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
  const discountCard = await getRhCardDiscountCard(currentUser?.id);
  const pricing = getRhCardCoursePricing(course.price, Boolean(discountCard));
  const enrolmentStatus = await getCourseEnrolmentStatus(course.id);
  const coursePath = publicCoursePath(course.slug);
  const reviews = await getApprovedCourseReviews(course.id);

  return (
    <>
      <Header bannerImage={cloudfrontAssetUrl(course.bannerImageUrl)} />
      <div className="container flex w-full flex-col-reverse gap-8 lg:flex-row lg:gap-12">
        <CourseOverviewSection
          courseOverview={course.courseOverview || course.description}
          whatYoullLearn={course.whatYouWillLearn || []}
          skillsAcquired={course.skillsAcquired || []}
          courseCurriculum={course.items.map((item, index) => ({
            moduleNumber: index + 1,
            lectureName: item.title?.trim() || `Lesson ${index + 1}`,
            duration: item.duration?.trim() || "Duration not specified",
            mediaType: /^(document|file)$/i.test(item.mediaType)
              ? item.mediaUrl.split(/[?#]/)[0].split(".").pop() ||
                item.mediaType
              : item.mediaType,
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
          totalHours={
            course.courseDuration ||
            (course.courseHours > 0
              ? `${course.courseHours} hours`
              : "Self-paced")
          }
          pricing={pricing}
          currency={course.currency || "INR"}
          isLoggedIn={Boolean(session?.user?.email)}
          isEnrolled={enrolmentStatus === "enrolled"}
          enrolmentStatus={enrolmentStatus}
          totalLectures={course.items.length}
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
  pricing,
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
  pricing: CoursePricing;
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
  return (
    <aside
      className="bg-card mt-10 h-fit w-full shrink-0 overflow-hidden rounded-2xl border shadow-sm lg:sticky lg:top-24 lg:mt-16 lg:w-88"
      aria-label="Course enrolment"
    >
      <div className="bg-primary/5 border-b p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-primary text-xs font-semibold tracking-widest uppercase">
            Your learning journey
          </span>
          {enrolmentStatus && (
            <Badge
              className="capitalize"
              variant={isEnrolled ? "default" : "secondary"}
            >
              {enrolmentStatus}
            </Badge>
          )}
        </div>
        <h2 className="text-xl leading-7 font-semibold tracking-tight">
          {title.replace("Certificate Course in", "").trim()}
        </h2>
      </div>
      <div className="p-6">
        <p className="text-muted-foreground mb-2 text-sm">Course fee</p>
        <CoursePrice pricing={pricing} currency={currency} prominent />
        {!isEnrolled &&
          pricing.originalAmount > 0 &&
          pricing.discountPercent === 0 && (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Purchase an RH card first to get {RH_CARD_DISCOUNT_PERCENT}% off
              courses while your card is active.{" "}
              <Link
                href={
                  isLoggedIn
                    ? "/dashboard/id-card"
                    : "/sign-in?callbackUrl=%2Fdashboard%2Fid-card"
                }
                className="text-primary font-medium underline underline-offset-4"
              >
                Get your RH card
              </Link>
            </p>
          )}
        <div className="mt-6 [&_button]:h-12 [&_button]:rounded-xl [&_button]:font-semibold">
          <CoursePurchaseButton
            courseId={courseId}
            coursePath={coursePath}
            courseTitle={title}
            amount={pricing.amount}
            currency={currency}
            isLoggedIn={isLoggedIn}
            isEnrolled={isEnrolled}
            user={user}
          />
        </div>
        {!isEnrolled && pricing.amount > 0 && (
          <p className="text-muted-foreground mt-3 flex items-center justify-center gap-1.5 text-xs">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Secure checkout
          </p>
        )}
        <div className="mt-6 border-t pt-6">
          <h3 className="mb-4 text-sm font-semibold">
            Included in this course
          </h3>
          <ul className="text-muted-foreground space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Clock3
                className="text-primary mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                <span className="text-foreground font-medium">
                  {totalHours}
                </span>{" "}
                of learning
              </span>
            </li>
            <li className="flex items-start gap-3">
              <FileText
                className="text-primary mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                <span className="text-foreground font-medium">
                  {totalLectures} learning{" "}
                  {totalLectures === 1 ? "item" : "items"}
                </span>{" "}
                in the curriculum
              </span>
            </li>
            <li className="flex items-start gap-3">
              <IconCertificate
                className="text-primary mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>Certificate for CNE credits</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

function CourseReviews({
  reviews,
}: {
  reviews: Awaited<ReturnType<typeof getApprovedCourseReviews>>;
}) {
  if (reviews.length === 0) return null;

  const averageRating =
    reviews.reduce((total, review) => total + review.rating, 0) /
    reviews.length;

  return (
    <section className="container py-12">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student reviews</h2>
          <p className="text-sm text-gray-600">
            Approved feedback from enrolled learners.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          {averageRating.toFixed(1)} out of 5 from {reviews.length} review
          {reviews.length === 1 ? "" : "s"}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-lg border p-5">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${index < review.rating ? "fill-current" : ""}`}
                />
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-700">
              {review.feedback}
            </p>
            <div className="mt-4 text-sm">
              <p className="font-semibold">{review.userName}</p>
              <p className="text-gray-500">
                {[
                  review.userDesignation,
                  review.userInstituteName,
                  review.userCity,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
