import { courseItem, lessonProgress } from "@/db";
import { db } from "@/lib/dbConfig";
import { getCourseAccess } from "@/lib/courseAccess";
import { and, asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import CourseViewer from "@/components/course/CourseViewer";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const access = await getCourseAccess(courseId);
  if (!access) notFound();
  const items = await db
    .select()
    .from(courseItem)
    .where(eq(courseItem.courseId, courseId))
    .orderBy(
      asc(courseItem.priority),
      asc(courseItem.createdAt),
      asc(courseItem.id),
    );
  const savedProgress = await db
    .select({
      itemId: lessonProgress.courseItemId,
      progress: lessonProgress.progress,
    })
    .from(lessonProgress)
    .innerJoin(courseItem, eq(courseItem.id, lessonProgress.courseItemId))
    .where(
      and(
        eq(courseItem.courseId, courseId),
        eq(lessonProgress.userId, access.userId),
      ),
    )
    .orderBy(desc(lessonProgress.updatedAt));
  // Legacy data can contain multiple records; use the newest for each lesson.
  const progressByItem = new Map<string, number>();
  for (const saved of savedProgress) {
    if (!progressByItem.has(saved.itemId))
      progressByItem.set(saved.itemId, saved.progress);
  }
  return (
    <div className="mx-auto max-w-5xl min-w-0 space-y-5">
      <header className="space-y-2">
        <Link
          href="/dashboard/courses"
          className="hover:text-primary text-sm font-medium text-slate-500"
        >
          ← My courses
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          {access.title}
        </h1>
      </header>
      <CourseViewer
        courseId={courseId}
        initialItemId={savedProgress[0]?.itemId}
        email={access.email}
        items={items.map((item) => ({
          id: item.id,
          progress: progressByItem.get(item.id) ?? 0,
          title: item.title || "Untitled lesson",
          duration: item.duration,
          type: /\.m3u8(?:\?|$)/i.test(item.mediaUrl)
            ? "application/x-mpegURL"
            : /^(mp4|video\/mp4)$/i.test(item.mediaType)
              ? "video/mp4"
              : item.mediaType,
        }))}
      />
    </div>
  );
}
