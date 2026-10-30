import { NextResponse } from "next/server";
import { withApiLogging } from "@/lib/logging/api";
import { getAuthenticatedApiEmail } from "@/lib/mobileApiAuth";
import { getMobileCourseCatalogDetail } from "@/lib/mobileCourseCatalog";

const headers = { "Cache-Control": "private, no-store" };
export const GET = withApiLogging(
  "/app/api/auth/mobile/course-catalog/[courseId]",
  async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> },
  ) {
    const email = await getAuthenticatedApiEmail(request);
    if (!email)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers },
      );
    const { courseId } = await params;
    const result = await getMobileCourseCatalogDetail(email, courseId);
    if (result.status !== "ok")
      return NextResponse.json(
        {
          error:
            result.status === "not_found"
              ? "Course not found"
              : "Active account required",
        },
        { status: result.status === "not_found" ? 404 : 403, headers },
      );
    return NextResponse.json(
      {
        success: true,
        course: result.course,
        isEnrolled: result.isEnrolled,
        isMember: result.isMember,
      },
      { headers },
    );
  },
);
