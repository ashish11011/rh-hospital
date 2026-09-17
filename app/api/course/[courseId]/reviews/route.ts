import { getApprovedCourseReviewsByIdentifier } from "@/lib/courseReviewData";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const reviews = await getApprovedCourseReviewsByIdentifier(decodeURIComponent(courseId));

    return NextResponse.json({ success: true, reviews }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch course reviews" }, { status: 500 });
  }
}
