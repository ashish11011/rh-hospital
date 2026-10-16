import { NextResponse } from "next/server";
import { getAuthenticatedApiEmail } from "@/lib/mobileApiAuth";
import {
  CoursePlaybackError,
  grantCourseDocument,
} from "@/lib/coursePlaybackAccess";

export const runtime = "nodejs";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string; itemId: string }> },
) {
  try {
    const email = await getAuthenticatedApiEmail(request);
    if (!email)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers },
      );
    const { courseId, itemId } = await params;
    const grant = await grantCourseDocument(courseId, itemId, email);
    return NextResponse.json(grant, { headers });
  } catch (error) {
    if (error instanceof CoursePlaybackError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers },
      );
    console.error("Course document grant failed", {
      type: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { error: "Unable to access course document" },
      { status: 503, headers },
    );
  }
}
