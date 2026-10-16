import { coursePlaybackResponse } from "@/lib/coursePlaybackRoute";

export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  return coursePlaybackResponse(request, (await params).courseId);
}
