import "server-only";

import { course, courseEnrolment, courseItem, user } from "@/db";
import { db } from "@/lib/dbConfig";
import { and, desc, eq } from "drizzle-orm";
import {
  canAccessCourseItem,
  hasActiveRhMembership,
} from "@/lib/courseItemAccess";
import { getLatestUserCard } from "@/lib/rhIdCard";

// Website item access never creates an enrollment or grants the rest of a course.
export async function getWebsiteCourseItemMedia(
  courseId: string,
  itemId: string,
  email: string,
) {
  if (!email.trim()) return null;
  const [item] = await db
    .select({
      mediaUrl: courseItem.mediaUrl,
      accessType: courseItem.accessType,
    })
    .from(courseItem)
    .innerJoin(course, eq(course.id, courseItem.courseId))
    .where(
      and(
        eq(course.id, courseId),
        eq(courseItem.id, itemId),
        eq(course.isActive, true),
      ),
    )
    .limit(1);
  if (!item) return null;

  const [account] = await db
    .select({ id: user.id })
    .from(user)
    .where(
      and(eq(user.email, email.trim().toLowerCase()), eq(user.isActive, true)),
    )
    .limit(1);
  if (!account) return null;
  if (canAccessCourseItem(item.accessType, { isLoggedIn: true }))
    return item.mediaUrl;
  const [enrolment] = await db
    .select({ status: courseEnrolment.enrolmentStatus })
    .from(courseEnrolment)
    .where(
      and(
        eq(courseEnrolment.courseId, courseId),
        eq(courseEnrolment.userId, account.id),
      ),
    )
    .orderBy(desc(courseEnrolment.createdAt), desc(courseEnrolment.id))
    .limit(1);
  const isMember =
    item.accessType === "free_for_members" && enrolment?.status !== "enrolled"
      ? hasActiveRhMembership(await getLatestUserCard(account.id))
      : false;
  return canAccessCourseItem(item.accessType, {
    isLoggedIn: true,
    isEnrolled: enrolment?.status === "enrolled",
    isMember,
  })
    ? item.mediaUrl
    : null;
}
