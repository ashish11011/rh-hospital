import { auth } from "@/auth";
import { course, courseEnrolment, user } from "@/db";
import { db } from "@/lib/dbConfig";
import { and, desc, eq } from "drizzle-orm";

export const isCourseId = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export async function getCourseAccess(courseId: string) {
  const session = await auth();
  if (!session?.user?.email || !isCourseId(courseId)) return null;
  const [access] = await db.select({ userId: user.id, title: course.title, email: user.email, status: courseEnrolment.enrolmentStatus })
    .from(courseEnrolment)
    .innerJoin(user, eq(user.id, courseEnrolment.userId))
    .innerJoin(course, eq(course.id, courseEnrolment.courseId))
    .where(and(eq(course.id, courseId), eq(user.email, session.user.email.toLowerCase()),
      eq(user.isActive, true), eq(course.isActive, true)))
    .orderBy(desc(courseEnrolment.createdAt), desc(courseEnrolment.id)).limit(1);
  return access?.status === "enrolled" ? access : null;
}
