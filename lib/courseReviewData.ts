import { course, courseReviews, user } from "@/db";
import { db } from "@/lib/dbConfig";
import { and, desc, eq, or } from "drizzle-orm";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function courseIdentifierWhere(courseIdentifier: string) {
  const cleanIdentifier = courseIdentifier.trim();
  const slugIdentifier = cleanIdentifier.replace(/^\/?courses\//, "");

  return uuidRegex.test(cleanIdentifier)
    ? eq(course.id, cleanIdentifier)
    : or(eq(course.slug, cleanIdentifier), eq(course.slug, slugIdentifier), eq(course.slug, `/courses/${slugIdentifier}`));
}

export async function getApprovedCourseReviews(courseId: string) {
  return db
    .select({
      id: courseReviews.id,
      rating: courseReviews.rating,
      feedback: courseReviews.feedback,
      createdAt: courseReviews.createdAt,
      userName: user.name,
      userDesignation: user.designation,
      userInstituteName: user.instituteName,
      userCity: user.city,
    })
    .from(courseReviews)
    .innerJoin(user, eq(user.id, courseReviews.userId))
    .where(and(eq(courseReviews.courseId, courseId), eq(courseReviews.isApproved, true)))
    .orderBy(desc(courseReviews.createdAt));
}

export async function getApprovedCourseReviewsByIdentifier(courseIdentifier: string) {
  const [record] = await db
    .select({ id: course.id })
    .from(course)
    .where(courseIdentifierWhere(courseIdentifier))
    .limit(1);

  if (!record) return [];

  return getApprovedCourseReviews(record.id);
}
