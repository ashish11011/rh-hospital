import { course, courseEnrolment, courseReviews, user } from "@/db";
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
    const rating = Math.floor(Number(body.rating));
    const feedback = typeof body.feedback === "string" ? body.feedback.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (!feedback) {
      return NextResponse.json({ error: "Review message is required" }, { status: 400 });
    }

    const [profile] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { courseId } = await params;
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
      return NextResponse.json({ error: "Only enrolled users can review this course" }, { status: 403 });
    }

    const [existingReview] = await db
      .select({ id: courseReviews.id })
      .from(courseReviews)
      .where(and(eq(courseReviews.courseId, courseRecord.id), eq(courseReviews.userId, profile.id)))
      .orderBy(desc(courseReviews.createdAt))
      .limit(1);

    if (existingReview) {
      const [updated] = await db
        .update(courseReviews)
        .set({
          rating,
          feedback,
          isApproved: false,
          createdAt: new Date(),
        })
        .where(eq(courseReviews.id, existingReview.id))
        .returning({
          id: courseReviews.id,
          rating: courseReviews.rating,
          feedback: courseReviews.feedback,
          isApproved: courseReviews.isApproved,
          createdAt: courseReviews.createdAt,
        });

      return NextResponse.json({ success: true, review: updated }, { status: 200 });
    }

    const [created] = await db
      .insert(courseReviews)
      .values({
        courseId: courseRecord.id,
        userId: profile.id,
        rating,
        feedback,
        isApproved: false,
      })
      .returning({
        id: courseReviews.id,
        rating: courseReviews.rating,
        feedback: courseReviews.feedback,
        isApproved: courseReviews.isApproved,
        createdAt: courseReviews.createdAt,
      });

    return NextResponse.json({ success: true, review: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}
