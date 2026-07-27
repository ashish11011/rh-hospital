import { NextResponse } from "next/server";
import { getAuthenticatedApiEmail } from "@/lib/mobileApiAuth";
import { getUserEnrolledCoursesByEmail } from "@/lib/userDashboardData";

export async function GET(req: Request) {
  try {
    const email = await getAuthenticatedApiEmail(req);

    if (!email) {
      return NextResponse.json({ error: "Unauthorized: Invalid token or session" }, { status: 401 });
    }

    const courses = await getUserEnrolledCoursesByEmail(email);

    return NextResponse.json({ success: true, courses }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch courses" }, { status: 500 });
  }
}
