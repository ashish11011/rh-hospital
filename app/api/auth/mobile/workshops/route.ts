import { NextResponse } from "next/server";
import { db } from "@/lib/dbConfig";
import { workshopRegistration, workshop } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { extractEmailFromToken } from "@/lib/verify-token";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const email = await extractEmailFromToken(token);

    if (!email) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Fetch workshop registrations for this user where payment is completed
    const userWorkshops = await db.select({
      registrationId: workshopRegistration.id,
      workshopId: workshop.id,
      name: workshop.name,
      description: workshop.description,
      startTime: workshop.startTime,
      endTime: workshop.endTime,
      bannerImage: workshop.bannerImage,
      modeOfAttendance: workshopRegistration.modeOfAttandnace,
      paymentStatus: workshopRegistration.paymentStatus,
      certificateUrl: workshopRegistration.certificateUrl,
      registeredAt: workshopRegistration.createdAt,
    })
    .from(workshopRegistration)
    .innerJoin(workshop, eq(workshopRegistration.workshopId, workshop.id))
    .where(
      and(
        eq(workshopRegistration.email, email.toLowerCase()),
        eq(workshopRegistration.paymentStatus, "completed")
      )
    )
    .orderBy(desc(workshopRegistration.createdAt));

    return NextResponse.json({ success: true, workshops: userWorkshops }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch registered workshops" }, { status: 500 });
  }
}
