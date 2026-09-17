import { course, courseItem } from "@/db";
import { cloudfrontAssetUrl } from "@/lib/cloudfront";
import { publicCoursePath } from "@/lib/course";
import { db } from "@/lib/dbConfig";
import { asc, desc, eq, inArray } from "drizzle-orm";

export async function getPublicCourseCatalog() {
  const courses = await db
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
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    })
    .from(course)
    .where(eq(course.isActive, true))
    .orderBy(desc(course.createdAt));

  const courseIds = courses.map((item) => item.id);
  const items =
    courseIds.length > 0
      ? await db
          .select({
            id: courseItem.id,
            courseId: courseItem.courseId,
            mediaType: courseItem.mediaType,
            title: courseItem.title,
            duration: courseItem.duration,
            priority: courseItem.priority,
            createdAt: courseItem.createdAt,
            updatedAt: courseItem.updatedAt,
          })
          .from(courseItem)
          .where(inArray(courseItem.courseId, courseIds))
          .orderBy(asc(courseItem.priority), asc(courseItem.createdAt))
      : [];

  const itemsByCourseId = new Map<string, typeof items>();
  for (const item of items) {
    const existingItems = itemsByCourseId.get(item.courseId) || [];
    existingItems.push(item);
    itemsByCourseId.set(item.courseId, existingItems);
  }

  return courses.map((item) => ({
    ...item,
    path: publicCoursePath(item.slug),
    bannerImageKey: item.bannerImageUrl,
    bannerImageUrl: cloudfrontAssetUrl(item.bannerImageUrl),
    items: (itemsByCourseId.get(item.id) || []).map((courseItem) => ({
      ...courseItem,
    })),
  }));
}
