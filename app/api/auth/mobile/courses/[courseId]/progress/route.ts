import { course, courseEnrolment, courseItem, lessonProgress, user } from "@/db";
import { db } from "@/lib/dbConfig";
import { getAuthenticatedApiEmail } from "@/lib/mobileApiAuth";
import { and, desc, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function courseIdentifierWhere(courseIdentifier: string) {
  const cleanIdentifier = courseIdentifier.trim();
  const slugIdentifier = cleanIdentifier.replace(/^\/?courses\//, "");

  return uuidRegex.test(cleanIdentifier)
    ? eq(course.id, cleanIdentifier)
    : or(eq(course.slug, cleanIdentifier), eq(course.slug, slugIdentifier), eq(course.slug, `/courses/${slugIdentifier}`));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const email = await getAuthenticatedApiEmail(req);

    if (!email) {
      return NextResponse.json({ error: "Unauthorized: Invalid token or session" }, { status: 401 });
    }

    const body = await req.json();
    const courseItemId = typeof body.courseItemId === "string" ? body.courseItemId.trim() : "";
    const progressSeconds = Math.max(0, Math.floor(
      body.progress !== undefined ? Number(body.progress) : Number(body.progressMs ?? 0) / 1000,
    ));
    const durationSeconds = Math.max(0, Math.floor(
      body.duration !== undefined ? Number(body.duration) : Number(body.durationMs ?? 0) / 1000,
    ));

    if (!courseItemId || !Number.isFinite(progressSeconds)) {
      return NextResponse.json({ error: "Course item and progress are required" }, { status: 400 });
    }

    const { courseId } = await params;

    const [profile] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [courseRecord] = await db
      .select({ id: course.id })
      .from(course)
      .where(courseIdentifierWhere(decodeURIComponent(courseId)))
      .limit(1);

    if (!courseRecord) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const [enrolment] = await db
      .select({ id: courseEnrolment.id, status: courseEnrolment.enrolmentStatus })
      .from(courseEnrolment)
      .where(and(eq(courseEnrolment.courseId, courseRecord.id), eq(courseEnrolment.userId, profile.id)))
      .orderBy(desc(courseEnrolment.createdAt))
      .limit(1);

    if (!enrolment || enrolment.status !== "enrolled") {
      return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 403 });
    }

    const [item] = await db
      .select({ id: courseItem.id })
      .from(courseItem)
      .where(and(eq(courseItem.id, courseItemId), eq(courseItem.courseId, courseRecord.id)))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Course item not found" }, { status: 404 });
    }

    const reachedCompletionThreshold = durationSeconds > 0 && progressSeconds >= Math.floor(durationSeconds * 0.9);
    const now = new Date();

    const [existingProgress] = await db
      .select({ id: lessonProgress.id, isCompleted: lessonProgress.isCompleted })
      .from(lessonProgress)
      .where(and(eq(lessonProgress.courseItemId, item.id), eq(lessonProgress.userId, profile.id)))
      .orderBy(desc(lessonProgress.updatedAt))
      .limit(1);

    if (existingProgress) {
      const [updated] = await db
        .update(lessonProgress)
        .set({
          progress: progressSeconds,
          isCompleted: Boolean(existingProgress.isCompleted || reachedCompletionThreshold),
          updatedAt: now,
        })
        .where(eq(lessonProgress.id, existingProgress.id))
        .returning({
          id: lessonProgress.id,
          progress: lessonProgress.progress,
          isCompleted: lessonProgress.isCompleted,
          updatedAt: lessonProgress.updatedAt,
        });

      return NextResponse.json({ success: true, progress: updated }, { status: 200 });
    }

    const [created] = await db
      .insert(lessonProgress)
      .values({
        courseItemId: item.id,
        userId: profile.id,
        progress: progressSeconds,
        isCompleted: reachedCompletionThreshold,
        updatedAt: now,
      })
      .returning({
        id: lessonProgress.id,
        progress: lessonProgress.progress,
        isCompleted: lessonProgress.isCompleted,
        updatedAt: lessonProgress.updatedAt,
      });

    return NextResponse.json({ success: true, progress: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update progress" }, { status: 500 });
  }
}
