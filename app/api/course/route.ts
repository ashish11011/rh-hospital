import { getPublicCourseCatalog } from "@/lib/publicCourseData";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const courses = await getPublicCourseCatalog();

    return NextResponse.json({ success: true, courses }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch courses" }, { status: 500 });
  }
}
