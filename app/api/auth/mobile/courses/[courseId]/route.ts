import { NextResponse } from "next/server";
import { getAuthenticatedApiEmail } from "@/lib/mobileApiAuth";
import { getPurchasedCourseDetailByEmail } from "@/lib/userDashboardData";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const email = await getAuthenticatedApiEmail(req);

    if (!email) {
      return NextResponse.json({ error: "Unauthorized: Invalid token or session" }, { status: 401 });
    }

    const { courseId } = await params;
    const result = await getPurchasedCourseDetailByEmail(email, decodeURIComponent(courseId));

    if (result.status === "not_found") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (result.status === "not_enrolled") {
      return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      enrolment: result.enrolment,
      course: result.course,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch course information" }, { status: 500 });
  }
}
