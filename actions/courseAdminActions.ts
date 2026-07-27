"use server";

import { course, courseEnrolment, courseItem, user } from "@/db";
import { db } from "@/lib/dbConfig";
import { asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cloudfrontAssetKey } from "@/lib/cloudfront";

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
  bannerImageUrl: cloudfrontAssetKey(data.bannerImageUrl),
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
  await db.insert(courseItem).values({ ...data, mediaUrl: cloudfrontAssetKey(data.mediaUrl) });
  revalidatePath(`/admin/course/${data.courseId}`);
}

export async function updateCourseItem(id: string, data: CourseItemInput) {
  await db.update(courseItem).set({ ...data, mediaUrl: cloudfrontAssetKey(data.mediaUrl), updatedAt: new Date() }).where(eq(courseItem.id, id));
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
