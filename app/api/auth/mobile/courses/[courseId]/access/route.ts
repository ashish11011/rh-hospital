import { withApiLogging } from "@/lib/logging/api";
import { coursePlaybackResponse } from "@/lib/coursePlaybackRoute";

export const runtime = "nodejs";
export const POST = withApiLogging(
  "/app/api/auth/mobile/courses/[courseId]/access",
  async function POST(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> },
  ) {
    return coursePlaybackResponse(request, (await params).courseId, true);
  },
);
