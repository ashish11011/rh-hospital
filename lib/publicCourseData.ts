import { course } from "@/db";
import { cloudfrontAssetUrl } from "@/lib/cloudfront";
import { publicCoursePath } from "@/lib/course";
import { db } from "@/lib/dbConfig";
import { desc, eq } from "drizzle-orm";

export async function getPublicCourseCatalog() {
  const courses = await db
    .select({
      id: course.id,
      title: course.title,
      description: course.description,
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

  return courses.map((item) => ({
    ...item,
    path: publicCoursePath(item.slug),
    bannerImageKey: item.bannerImageUrl,
    bannerImageUrl: cloudfrontAssetUrl(item.bannerImageUrl),
  }));
}
