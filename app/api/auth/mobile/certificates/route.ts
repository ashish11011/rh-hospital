import { NextResponse } from "next/server";
import {
  seminar,
  seminarRegistrations,
  user,
  workshop,
  workshopRegistration,
} from "@/db";
import { db } from "@/lib/dbConfig";
import { getAuthenticatedApiEmail } from "@/lib/mobileApiAuth";
import { and, desc, eq, isNotNull } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const email = await getAuthenticatedApiEmail(req);

    if (!email) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token or session" },
        { status: 401 },
      );
    }

    const [userProfile] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!userProfile) {
      return NextResponse.json(
        {
          success: true,
          workshopCertificates: [],
          seminarCertificates: [],
          certificates: [],
        },
        { status: 200 },
      );
    }

    const workshopCertificates = await db
      .select({
        certificate: workshopRegistration.certificateUrl,
        workshopName: workshop.name,
        workshopId: workshop.id,
        workshopImage: workshop.bannerImage,
        workshopTime: workshop.startTime,
      })
      .from(workshopRegistration)
      .where(
        and(
          eq(workshopRegistration.userId, userProfile.id),
          isNotNull(workshopRegistration.certificateUrl),
        ),
      )
      .innerJoin(workshop, eq(workshop.id, workshopRegistration.workshopId))
      .orderBy(desc(workshop.startTime));

    const seminarCertificates = await db
      .select({
        certificate: seminarRegistrations.certificateUrl,
        workshopName: seminar.name,
        workshopId: seminar.id,
        workshopImage: seminar.bannerImage,
        workshopTime: seminar.startTime,
      })
      .from(seminarRegistrations)
      .where(
        and(
          eq(seminarRegistrations.userId, userProfile.id),
          isNotNull(seminarRegistrations.certificateUrl),
        ),
      )
      .innerJoin(seminar, eq(seminar.id, seminarRegistrations.seminarId))
      .orderBy(desc(seminar.startTime));

    return NextResponse.json(
      {
        success: true,
        workshopCertificates: workshopCertificates.map((certificate) => ({
          ...certificate,
          type: "workshop",
        })),
        seminarCertificates: seminarCertificates.map((certificate) => ({
          ...certificate,
          type: "seminar",
        })),
        certificates: [
          ...workshopCertificates.map((certificate) => ({
            ...certificate,
            type: "workshop",
          })),
          ...seminarCertificates.map((certificate) => ({
            ...certificate,
            type: "seminar",
          })),
        ],
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch certificates" },
      { status: 500 },
    );
  }
}
