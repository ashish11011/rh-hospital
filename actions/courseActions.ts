"use server";

import { auth } from "@/auth";
import { course, courseEnrolment, courseItem, user } from "@/db";
import { db } from "@/lib/dbConfig";
import { getPublicCourseCatalog } from "@/lib/publicCourseData";
import { getUserEnrolledCoursesByEmail } from "@/lib/userDashboardData";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function getPublicCourses() {
  return getPublicCourseCatalog();
}

export async function getPublicCourseBySlug(slug: string) {
  const candidates = [slug, `/courses/${slug}`];
  const [record] = await db.select().from(course).where(inArray(course.slug, candidates)).limit(1);
  if (!record || record.isActive === false) return null;

  const items = await db
    .select()
    .from(courseItem)
    .where(eq(courseItem.courseId, record.id))
    .orderBy(asc(courseItem.priority), asc(courseItem.createdAt));

  return { ...record, items };
}

export async function getCurrentCourseUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const [profile] = await db
    .select()
    .from(user)
    .where(eq(user.email, session.user.email.toLowerCase()))
    .limit(1);

  return profile ?? null;
}

export async function getCourseEnrolmentStatus(courseId: string) {
  const profile = await getCurrentCourseUser();
  if (!profile) return null;

  const [enrolment] = await db
    .select({ status: courseEnrolment.enrolmentStatus })
    .from(courseEnrolment)
    .where(and(eq(courseEnrolment.courseId, courseId), eq(courseEnrolment.userId, profile.id)))
    .orderBy(desc(courseEnrolment.createdAt))
    .limit(1);

  return enrolment?.status ?? null;
}

export async function getUserEnrolledCourses() {
  const profile = await getCurrentCourseUser();
  if (!profile) redirect("/sign-in");

  return getUserEnrolledCoursesByEmail(profile.email);
}
