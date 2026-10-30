import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { courseEnrolment, user } from "@/db";
import { db } from "@/lib/dbConfig";
import { getPublicCourseCatalog } from "@/lib/publicCourseData";
import { getLatestUserCard } from "@/lib/rhIdCard";
import {
  canAccessCourseItem,
  hasActiveRhMembership,
} from "@/lib/courseItemAccess";

export async function getMobileCourseCatalogDetail(
  email: string,
  identifier: string,
) {
  const courses = await getPublicCourseCatalog();
  const slug = identifier.replace(/^\/?courses\//, "").replace(/\/$/, "");
  const course = courses.find(
    (item) =>
      item.id === identifier ||
      item.slug.replace(/^\/?courses\//, "").replace(/\/$/, "") === slug,
  );
  if (!course) return { status: "not_found" as const };
  const [account] = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.email, email.toLowerCase()), eq(user.isActive, true)))
    .limit(1);
  if (!account) return { status: "forbidden" as const };
  const [enrolment] = await db
    .select({ status: courseEnrolment.enrolmentStatus })
    .from(courseEnrolment)
    .where(
      and(
        eq(courseEnrolment.courseId, course.id),
        eq(courseEnrolment.userId, account.id),
      ),
    )
    .orderBy(desc(courseEnrolment.createdAt), desc(courseEnrolment.id))
    .limit(1);
  const isEnrolled = enrolment?.status === "enrolled";
  const isMember = hasActiveRhMembership(await getLatestUserCard(account.id));
  return {
    status: "ok" as const,
    isEnrolled,
    isMember,
    course: {
      ...course,
      items: course.items.map((item) => ({
        ...item,
        canAccess: canAccessCourseItem(item.accessType, {
          isLoggedIn: true,
          isEnrolled,
          isMember,
        }),
      })),
    },
  };
}
