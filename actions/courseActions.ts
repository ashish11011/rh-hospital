"use server";
import { runLoggedOperation } from "@/lib/logging/operations";

import { auth } from "@/auth";
import { course, courseEnrolment, courseItem, user } from "@/db";
import { db } from "@/lib/dbConfig";
import { getPublicCourseCatalog } from "@/lib/publicCourseData";
import { getUserEnrolledCoursesByEmail } from "@/lib/userDashboardData";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function getPublicCourses() {
  return runLoggedOperation(
    "service",
    "actions/courseActions.ts:getPublicCourses",
    async () => {
      return getPublicCourseCatalog();
    },
    true,
  );
}

export async function getPublicCourseBySlug(slug: string) {
  return runLoggedOperation(
    "service",
    "actions/courseActions.ts:getPublicCourseBySlug",
    async () => {
      const candidates = [slug, `/courses/${slug}`];
      const [record] = await db
        .select()
        .from(course)
        .where(inArray(course.slug, candidates))
        .limit(1);
      if (!record || record.isActive === false) return null;

      const items = await db
        .select()
        .from(courseItem)
        .where(eq(courseItem.courseId, record.id))
        .orderBy(asc(courseItem.priority), asc(courseItem.createdAt));

      return { ...record, items };
    },
    true,
  );
}

export async function getCurrentCourseUser() {
  return runLoggedOperation(
    "service",
    "actions/courseActions.ts:getCurrentCourseUser",
    async () => {
      const session = await auth();
      if (!session?.user?.email) return null;

      const [profile] = await db
        .select()
        .from(user)
        .where(eq(user.email, session.user.email.toLowerCase()))
        .limit(1);

      return profile ?? null;
    },
    true,
  );
}

export async function getCourseEnrolmentStatus(courseId: string) {
  return runLoggedOperation(
    "service",
    "actions/courseActions.ts:getCourseEnrolmentStatus",
    async () => {
      const profile = await getCurrentCourseUser();
      if (!profile) return null;

      const [enrolment] = await db
        .select({ status: courseEnrolment.enrolmentStatus })
        .from(courseEnrolment)
        .where(
          and(
            eq(courseEnrolment.courseId, courseId),
            eq(courseEnrolment.userId, profile.id),
          ),
        )
        .orderBy(desc(courseEnrolment.createdAt))
        .limit(1);

      return enrolment?.status ?? null;
    },
    true,
  );
}

export async function getUserEnrolledCourses() {
  return runLoggedOperation(
    "service",
    "actions/courseActions.ts:getUserEnrolledCourses",
    async () => {
      const profile = await getCurrentCourseUser();
      if (!profile) redirect("/sign-in");

      return getUserEnrolledCoursesByEmail(profile.email);
    },
    true,
  );
}
