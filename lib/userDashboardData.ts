import { course, courseEnrolment, courseItem, lessonProgress, payment, user } from "@/db";
import { cloudfrontAssetUrl } from "@/lib/cloudfront";
import { publicCoursePath } from "@/lib/course";
import { db } from "@/lib/dbConfig";
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getUserEnrolledCoursesByEmail(email: string) {
  return db
    .select({
      enrolmentId: courseEnrolment.id,
      status: courseEnrolment.enrolmentStatus,
      enrolledAt: courseEnrolment.createdAt,
      courseId: course.id,
      title: course.title,
      description: course.description,
      bannerImageUrl: course.bannerImageUrl,
      slug: course.slug,
      courseHours: course.courseHours,
      courseDuration: course.courseDuration,
      totalLectures: course.totalLectures,
    })
    .from(courseEnrolment)
    .innerJoin(course, eq(course.id, courseEnrolment.courseId))
    .innerJoin(user, eq(user.id, courseEnrolment.userId))
    .where(and(eq(courseEnrolment.enrolmentStatus, "enrolled"), eq(user.email, email.toLowerCase())))
    .orderBy(desc(courseEnrolment.createdAt));
}

export async function getUserPurchasesByEmail(email: string) {
  return db
    .select({
      id: payment.id,
      orderType: payment.orderType,
      orderId: payment.orderId,
      currency: payment.currency,
      gatewayPaymentEventId: payment.gatewayPaymentEventId,
      modeOfPayment: payment.modeOfPayment,
      amount: payment.amount,
      transactionDate: payment.transactionDate,
      status: payment.status,
      createdAt: payment.createdAt,
      gatewayOrderId: payment.gatewayOrderId,
    })
    .from(payment)
    .where(eq(payment.email, email.toLowerCase()))
    .orderBy(desc(payment.createdAt));
}

export async function getPurchasedCourseDetailByEmail(email: string, courseIdentifier: string) {
  const cleanIdentifier = courseIdentifier.trim();
  const slugIdentifier = cleanIdentifier.replace(/^\/?courses\//, "");
  const courseWhere = uuidRegex.test(cleanIdentifier)
    ? eq(course.id, cleanIdentifier)
    : or(eq(course.slug, cleanIdentifier), eq(course.slug, slugIdentifier), eq(course.slug, `/courses/${slugIdentifier}`));

  const [courseRecord] = await db
    .select({
      id: course.id,
      title: course.title,
      description: course.description,
      content: course.content,
      price: course.price,
      currency: course.currency,
      bannerImageUrl: course.bannerImageUrl,
      courseHours: course.courseHours,
      courseDuration: course.courseDuration,
      totalLectures: course.totalLectures,
      slug: course.slug,
      courseOverview: course.courseOverview,
      whatYouWillLearn: course.whatYouWillLearn,
      skillsAcquired: course.skillsAcquired,
      isActive: course.isActive,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    })
    .from(course)
    .where(courseWhere)
    .limit(1);

  if (!courseRecord || courseRecord.isActive === false) {
    return { status: "not_found" as const };
  }

  const [enrolment] = await db
    .select({
      id: courseEnrolment.id,
      status: courseEnrolment.enrolmentStatus,
      enrolledAt: courseEnrolment.createdAt,
      userId: user.id,
    })
    .from(courseEnrolment)
    .innerJoin(user, eq(user.id, courseEnrolment.userId))
    .where(
      and(
        eq(courseEnrolment.courseId, courseRecord.id),
        eq(user.email, email.toLowerCase()),
      ),
    )
    .orderBy(desc(courseEnrolment.createdAt))
    .limit(1);

  if (!enrolment || enrolment.status !== "enrolled") {
    return { status: "not_enrolled" as const, courseId: courseRecord.id };
  }

  const items = await db
    .select({
      id: courseItem.id,
      courseId: courseItem.courseId,
      mediaUrl: courseItem.mediaUrl,
      mediaType: courseItem.mediaType,
      title: courseItem.title,
      duration: courseItem.duration,
      priority: courseItem.priority,
      createdAt: courseItem.createdAt,
      updatedAt: courseItem.updatedAt,
    })
    .from(courseItem)
    .where(eq(courseItem.courseId, courseRecord.id))
    .orderBy(asc(courseItem.priority), asc(courseItem.createdAt));

  const progressRows = items.length > 0
    ? await db
      .select({
        courseItemId: lessonProgress.courseItemId,
        progress: lessonProgress.progress,
        updatedAt: lessonProgress.updatedAt,
      })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, enrolment.userId), inArray(lessonProgress.courseItemId, items.map((item) => item.id))))
    : [];

  const progressByItemId = new Map(progressRows.map((row) => [row.courseItemId, row]));

  const { isActive, ...purchasedCourse } = courseRecord;

  return {
    status: "ok" as const,
    enrolment: {
      id: enrolment.id,
      status: enrolment.status,
      enrolledAt: enrolment.enrolledAt,
    },
    course: {
      ...purchasedCourse,
      path: publicCoursePath(purchasedCourse.slug),
      bannerImageKey: purchasedCourse.bannerImageUrl,
      bannerImageUrl: cloudfrontAssetUrl(purchasedCourse.bannerImageUrl),
      items: items.map((item) => {
        const progress = progressByItemId.get(item.id);

        return {
          ...item,
          mediaKey: item.mediaUrl,
          mediaUrl: cloudfrontAssetUrl(item.mediaUrl),
          progress: progress?.progress ?? 0,
          progressUpdatedAt: progress?.updatedAt ?? null,
        };
      }),
    },
  };
}
