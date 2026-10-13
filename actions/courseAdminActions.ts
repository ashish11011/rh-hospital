"use server";

import { course, courseEnrolment, courseItem, courseReviews, user } from "@/db";
import { db } from "@/lib/dbConfig";
import { asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { publicAssetKey, courseAssetKey } from "@/lib/publicAsset";
import { publicCoursePath } from "@/lib/course";

export type CourseInput = {
  title: string;
  description: string;
  content?: string | null;
  currency?: string;
  price: number;
  isActive: boolean;
  bannerImageUrl: string;
  courseHours: number;
  courseDuration?: string | null;
  totalLectures: number;
  slug: string;
  courseOverview?: string | null;
  whatYouWillLearn?: string[];
  skillsAcquired?: string[];
};

export type CourseItemInput = {
  courseId: string;
  mediaUrl: string;
  mediaType: string;
  title?: string | null;
  duration?: string | null;
  priority: number;
};

const cleanCourse = (data: CourseInput) => ({
  ...data,
  title: data.title.trim(),
  description: data.description.trim(),
  slug: data.slug.trim(),
  bannerImageUrl: publicAssetKey(data.bannerImageUrl),
  currency: data.currency?.trim() || "INR",
  whatYouWillLearn: data.whatYouWillLearn?.filter(Boolean) || [],
  skillsAcquired: data.skillsAcquired?.filter(Boolean) || [],
  updatedAt: new Date(),
});

export async function getAdminCourses() {
  return db.select().from(course).orderBy(desc(course.createdAt));
}

export async function getAdminCourse(id: string) {
  const [record] = await db.select().from(course).where(eq(course.id, id)).limit(1);
  return record ?? null;
}

export async function createCourse(data: CourseInput) {
  if (!data.title.trim() || !data.slug.trim() || !data.bannerImageUrl.trim()) throw new Error("Title, slug and banner image key are required");
  const [created] = await db.insert(course).values(cleanCourse(data)).returning({ id: course.id });
  revalidatePath("/admin/course");
  revalidatePath("/courses");
  return created;
}

export async function updateCourse(id: string, data: CourseInput) {
  if (!data.title.trim() || !data.slug.trim() || !data.bannerImageUrl.trim()) throw new Error("Title, slug and banner image key are required");
  await db.update(course).set(cleanCourse(data)).where(eq(course.id, id));
  revalidatePath("/admin/course");
  revalidatePath(`/admin/course/${id}`);
  revalidatePath("/courses");
  revalidatePath(`/courses/${data.slug}`);
}

export async function deleteCourse(id: string) {
  await db.transaction(async (tx) => {
    await tx.delete(courseEnrolment).where(eq(courseEnrolment.courseId, id));
    await tx.delete(courseItem).where(eq(courseItem.courseId, id));
    await tx.delete(course).where(eq(course.id, id));
  });
  revalidatePath("/admin/course");
  revalidatePath("/courses");
}

export async function getCourseItems(courseId: string) {
  return db.select().from(courseItem).where(eq(courseItem.courseId, courseId)).orderBy(asc(courseItem.priority));
}

export async function createCourseItem(data: CourseItemInput) {
  if (!data.mediaUrl.trim() || !data.mediaType.trim()) throw new Error("Media key and type are required");
  await db.insert(courseItem).values({ ...data, mediaUrl: courseAssetKey(data.mediaUrl, data.mediaType) });
  revalidatePath(`/admin/course/${data.courseId}`);
}

export async function updateCourseItem(id: string, data: CourseItemInput) {
  await db.update(courseItem).set({ ...data, mediaUrl: courseAssetKey(data.mediaUrl, data.mediaType), updatedAt: new Date() }).where(eq(courseItem.id, id));
  revalidatePath(`/admin/course/${data.courseId}`);
}

export async function deleteCourseItem(id: string, courseId: string) {
  await db.delete(courseItem).where(eq(courseItem.id, id));
  revalidatePath(`/admin/course/${courseId}`);
}

export async function getCourseEnrolments() {
  return db
    .select({
      id: courseEnrolment.id,
      status: courseEnrolment.enrolmentStatus,
      enrolledAt: courseEnrolment.createdAt,
      userName: user.name,
      userEmail: user.email,
      mobileNumber: user.mobileNumber,
      courseTitle: course.title,
    })
    .from(courseEnrolment)
    .innerJoin(user, eq(courseEnrolment.userId, user.id))
    .innerJoin(course, eq(courseEnrolment.courseId, course.id))
    .orderBy(desc(courseEnrolment.createdAt));
}

export async function updateCourseEnrolmentStatus(id: string, status: "enrolled" | "pending" | "expired" | "refunded") {
  const allowed = ["enrolled", "pending", "expired", "refunded"];
  if (!allowed.includes(status)) throw new Error("Invalid enrolment status");
  await db.update(courseEnrolment).set({ enrolmentStatus: status, updatedAt: new Date() }).where(eq(courseEnrolment.id, id));
  revalidatePath("/admin/course-enrolments");
}

export async function getAdminCourseReviews() {
  return db
    .select({
      id: courseReviews.id,
      rating: courseReviews.rating,
      feedback: courseReviews.feedback,
      isApproved: courseReviews.isApproved,
      createdAt: courseReviews.createdAt,
      courseId: course.id,
      courseTitle: course.title,
      courseSlug: course.slug,
      userName: user.name,
      userEmail: user.email,
      userMobileNumber: user.mobileNumber,
      userDesignation: user.designation,
      userInstituteName: user.instituteName,
    })
    .from(courseReviews)
    .innerJoin(course, eq(courseReviews.courseId, course.id))
    .innerJoin(user, eq(courseReviews.userId, user.id))
    .orderBy(desc(courseReviews.createdAt));
}

export async function updateCourseReviewApproval(id: string, isApproved: boolean) {
  const [reviewCourse] = await db
    .select({ slug: course.slug })
    .from(courseReviews)
    .innerJoin(course, eq(courseReviews.courseId, course.id))
    .where(eq(courseReviews.id, id))
    .limit(1);

  await db.update(courseReviews).set({ isApproved }).where(eq(courseReviews.id, id));
  revalidatePath("/admin/course-reviews");
  revalidatePath("/courses");
  if (reviewCourse?.slug) revalidatePath(publicCoursePath(reviewCourse.slug));
}

export async function deleteCourseReview(id: string) {
  const [reviewCourse] = await db
    .select({ slug: course.slug })
    .from(courseReviews)
    .innerJoin(course, eq(courseReviews.courseId, course.id))
    .where(eq(courseReviews.id, id))
    .limit(1);

  await db.delete(courseReviews).where(eq(courseReviews.id, id));
  revalidatePath("/admin/course-reviews");
  revalidatePath("/courses");
  if (reviewCourse?.slug) revalidatePath(publicCoursePath(reviewCourse.slug));
}
