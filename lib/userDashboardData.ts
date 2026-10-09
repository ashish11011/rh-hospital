import {
  course,
  courseEnrolment,
  courseItem,
  lessonProgress,
  payment,
  user,
} from "@/db";
import { cloudfrontAssetUrl } from "@/lib/cloudfront";
import { publicCoursePath } from "@/lib/course";
import { getApprovedCourseReviews } from "@/lib/courseReviewData";
import { db } from "@/lib/dbConfig";
import { isRhCardPayment } from "@/lib/rhIdCardPayment";
import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getUserEnrolledCoursesByEmail(email: string) {
  const enrolments = await db
    .select({
      enrolmentId: courseEnrolment.id,
      status: courseEnrolment.enrolmentStatus,
      enrolledAt: courseEnrolment.createdAt,
      userId: user.id,
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
    .where(
      and(
        eq(courseEnrolment.enrolmentStatus, "enrolled"),
        eq(user.email, email.toLowerCase()),
      ),
    )
    .orderBy(desc(courseEnrolment.createdAt));

  if (enrolments.length === 0) return [];

  const courseIds = enrolments.map((item) => item.courseId);
  const items = await db
    .select({
      id: courseItem.id,
      courseId: courseItem.courseId,
      mediaType: courseItem.mediaType,
    })
    .from(courseItem)
    .where(inArray(courseItem.courseId, courseIds));

  const itemIds = items.map((item) => item.id);
  const progressRows =
    itemIds.length > 0
      ? await db
          .select({
            courseItemId: lessonProgress.courseItemId,
            isCompleted: lessonProgress.isCompleted,
          })
          .from(lessonProgress)
          .where(
            and(
              eq(lessonProgress.userId, enrolments[0].userId),
              inArray(lessonProgress.courseItemId, itemIds),
            ),
          )
      : [];

  const completedItemIds = new Set(
    progressRows
      .filter((row) => row.isCompleted)
      .map((row) => row.courseItemId),
  );
  const progressByCourseId = new Map<
    string,
    { completed: number; total: number }
  >();

  for (const item of items) {
    if (item.mediaType?.toLowerCase() === "pdf") continue;

    const current = progressByCourseId.get(item.courseId) || {
      completed: 0,
      total: 0,
    };
    current.total += 1;
    if (completedItemIds.has(item.id)) current.completed += 1;
    progressByCourseId.set(item.courseId, current);
  }

  return enrolments.map(({ userId, ...item }) => {
    const summary = progressByCourseId.get(item.courseId) || {
      completed: 0,
      total: 0,
    };

    return {
      ...item,
      completedLessons: summary.completed,
      totalTrackableLessons: summary.total,
      progressPercent:
        summary.total > 0
          ? Math.round((summary.completed / summary.total) * 100)
          : 0,
    };
  });
}

export async function getUserPurchasesByEmail(email: string) {
  const purchases = await db
    .select({
      id: payment.id,
      orderType: payment.orderType,
      orderId: payment.orderId,
      currency: payment.currency,
      gatewayPaymentEventId: payment.gatewayPaymentEventId,
      modeOfPayment: payment.modeOfPayment,
      amount:
        sql<number>`case when ${payment.applePriceMilliunits} is not null then ${payment.applePriceMilliunits} / 1000.0 else ${payment.amount} end`.mapWith(
          Number,
        ),
      transactionDate: payment.transactionDate,
      status: payment.status,
      createdAt: payment.createdAt,
      gatewayOrderId: payment.gatewayOrderId,
      notes: payment.notes,
    })
    .from(payment)
    .where(eq(payment.email, email.toLowerCase()))
    .orderBy(desc(payment.createdAt));
  return purchases.map(({ notes, ...purchase }) => ({
    ...purchase,
    orderType: isRhCardPayment({ orderType: purchase.orderType, notes })
      ? "RH ID card"
      : purchase.orderType,
  }));
}

export async function getPurchasedCourseDetailByEmail(
  email: string,
  courseIdentifier: string,
) {
  const cleanIdentifier = courseIdentifier.trim();
  const slugIdentifier = cleanIdentifier.replace(/^\/?courses\//, "");
  const courseWhere = uuidRegex.test(cleanIdentifier)
    ? eq(course.id, cleanIdentifier)
    : or(
        eq(course.slug, cleanIdentifier),
        eq(course.slug, slugIdentifier),
        eq(course.slug, `/courses/${slugIdentifier}`),
      );

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

  const progressRows =
    items.length > 0
      ? await db
          .select({
            courseItemId: lessonProgress.courseItemId,
            progress: lessonProgress.progress,
            isCompleted: lessonProgress.isCompleted,
            updatedAt: lessonProgress.updatedAt,
          })
          .from(lessonProgress)
          .where(
            and(
              eq(lessonProgress.userId, enrolment.userId),
              inArray(
                lessonProgress.courseItemId,
                items.map((item) => item.id),
              ),
            ),
          )
      : [];

  const progressByItemId = new Map(
    progressRows.map((row) => [row.courseItemId, row]),
  );
  const trackableItems = items.filter(
    (item) => item.mediaType?.toLowerCase() !== "pdf",
  );
  const completedLessons = trackableItems.filter(
    (item) => progressByItemId.get(item.id)?.isCompleted,
  ).length;
  const reviews = await getApprovedCourseReviews(courseRecord.id);

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
      completedLessons,
      totalTrackableLessons: trackableItems.length,
      progressPercent:
        trackableItems.length > 0
          ? Math.round((completedLessons / trackableItems.length) * 100)
          : 0,
      reviews,
      items: items.map((item) => {
        const progress = progressByItemId.get(item.id);

        return {
          ...item,
          mediaKey: item.mediaUrl,
          mediaUrl: cloudfrontAssetUrl(item.mediaUrl),
          progress: progress?.progress ?? 0,
          isCompleted: progress?.isCompleted ?? false,
          progressUpdatedAt: progress?.updatedAt ?? null,
        };
      }),
    },
  };
}
