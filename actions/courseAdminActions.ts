"use server";
import { runLoggedOperation } from "@/lib/logging/operations";

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
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:getAdminCourses",
    async () => {
      return db.select().from(course).orderBy(desc(course.createdAt));
    },
    true,
  );
}

export async function getAdminCourse(id: string) {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:getAdminCourse",
    async () => {
      const [record] = await db
        .select()
        .from(course)
        .where(eq(course.id, id))
        .limit(1);
      return record ?? null;
    },
    true,
  );
}

export async function createCourse(data: CourseInput) {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:createCourse",
    async () => {
      if (
        !data.title.trim() ||
        !data.slug.trim() ||
        !data.bannerImageUrl.trim()
      )
        throw new Error("Title, slug and banner image key are required");
      const [created] = await db
        .insert(course)
        .values(cleanCourse(data))
        .returning({ id: course.id });
      revalidatePath("/admin/course");
      revalidatePath("/courses");
      return created;
    },
    true,
  );
}

export async function updateCourse(id: string, data: CourseInput) {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:updateCourse",
    async () => {
      if (
        !data.title.trim() ||
        !data.slug.trim() ||
        !data.bannerImageUrl.trim()
      )
        throw new Error("Title, slug and banner image key are required");
      await db.update(course).set(cleanCourse(data)).where(eq(course.id, id));
      revalidatePath("/admin/course");
      revalidatePath(`/admin/course/${id}`);
      revalidatePath("/courses");
      revalidatePath(`/courses/${data.slug}`);
    },
    true,
  );
}

export async function deleteCourse(id: string) {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:deleteCourse",
    async () => {
      await db.transaction(async (tx) => {
        await tx
          .delete(courseEnrolment)
          .where(eq(courseEnrolment.courseId, id));
        await tx.delete(courseItem).where(eq(courseItem.courseId, id));
        await tx.delete(course).where(eq(course.id, id));
      });
      revalidatePath("/admin/course");
      revalidatePath("/courses");
    },
    true,
  );
}

export async function getCourseItems(courseId: string) {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:getCourseItems",
    async () => {
      return db
        .select()
        .from(courseItem)
        .where(eq(courseItem.courseId, courseId))
        .orderBy(asc(courseItem.priority));
    },
    true,
  );
}

export async function createCourseItem(data: CourseItemInput) {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:createCourseItem",
    async () => {
      if (!data.mediaUrl.trim() || !data.mediaType.trim())
        throw new Error("Media key and type are required");
      await db
        .insert(courseItem)
        .values({
          ...data,
          mediaUrl: courseAssetKey(data.mediaUrl, data.mediaType),
        });
      revalidatePath(`/admin/course/${data.courseId}`);
    },
    true,
  );
}

export async function updateCourseItem(id: string, data: CourseItemInput) {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:updateCourseItem",
    async () => {
      await db
        .update(courseItem)
        .set({
          ...data,
          mediaUrl: courseAssetKey(data.mediaUrl, data.mediaType),
          updatedAt: new Date(),
        })
        .where(eq(courseItem.id, id));
      revalidatePath(`/admin/course/${data.courseId}`);
    },
    true,
  );
}

export async function deleteCourseItem(id: string, courseId: string) {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:deleteCourseItem",
    async () => {
      await db.delete(courseItem).where(eq(courseItem.id, id));
      revalidatePath(`/admin/course/${courseId}`);
    },
    true,
  );
}

export async function getCourseEnrolments() {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:getCourseEnrolments",
    async () => {
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
    },
    true,
  );
}

export async function updateCourseEnrolmentStatus(
  id: string,
  status: "enrolled" | "pending" | "expired" | "refunded",
) {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:updateCourseEnrolmentStatus",
    async () => {
      const allowed = ["enrolled", "pending", "expired", "refunded"];
      if (!allowed.includes(status))
        throw new Error("Invalid enrolment status");
      await db
        .update(courseEnrolment)
        .set({ enrolmentStatus: status, updatedAt: new Date() })
        .where(eq(courseEnrolment.id, id));
      revalidatePath("/admin/course-enrolments");
    },
    true,
  );
}

export async function getAdminCourseReviews() {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:getAdminCourseReviews",
    async () => {
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
    },
    true,
  );
}

export async function updateCourseReviewApproval(
  id: string,
  isApproved: boolean,
) {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:updateCourseReviewApproval",
    async () => {
      const [reviewCourse] = await db
        .select({ slug: course.slug })
        .from(courseReviews)
        .innerJoin(course, eq(courseReviews.courseId, course.id))
        .where(eq(courseReviews.id, id))
        .limit(1);

      await db
        .update(courseReviews)
        .set({ isApproved })
        .where(eq(courseReviews.id, id));
      revalidatePath("/admin/course-reviews");
      revalidatePath("/courses");
      if (reviewCourse?.slug)
        revalidatePath(publicCoursePath(reviewCourse.slug));
    },
    true,
  );
}

export async function deleteCourseReview(id: string) {
  return runLoggedOperation(
    "service",
    "actions/courseAdminActions.ts:deleteCourseReview",
    async () => {
      const [reviewCourse] = await db
        .select({ slug: course.slug })
        .from(courseReviews)
        .innerJoin(course, eq(courseReviews.courseId, course.id))
        .where(eq(courseReviews.id, id))
        .limit(1);

      await db.delete(courseReviews).where(eq(courseReviews.id, id));
      revalidatePath("/admin/course-reviews");
      revalidatePath("/courses");
      if (reviewCourse?.slug)
        revalidatePath(publicCoursePath(reviewCourse.slug));
    },
    true,
  );
}
