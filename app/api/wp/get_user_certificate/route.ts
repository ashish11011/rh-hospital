import { workshopRegistration, seminarRegistrations } from "@/db";
import { db } from "@/lib/dbConfig";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const workshopId = searchParams.get("workshopId");
    const seminarId = searchParams.get("seminarId");
    if (!userId || (!workshopId && !seminarId)) {
        return NextResponse.json(
            { message: "Missing 'userId' or 'workshopId'/'seminarId' query parameter", status: 400 },
            { status: 400 }
        );
    }

    try {
        let result;

        if (seminarId) {
            result = await db
                .select({
                    certificateUrl: seminarRegistrations.certificateUrl,
                })
                .from(seminarRegistrations)
                .where(
                    and(
                        eq(seminarRegistrations.userId, userId),
                        eq(seminarRegistrations.seminarId, seminarId)
                    )
                );
        } else {
            result = await db
                .select({
                    certificateUrl: workshopRegistration.certificateUrl,
                })
                .from(workshopRegistration)
                .where(
                    and(
                        eq(workshopRegistration.userId, userId!),
                        eq(workshopRegistration.workshopId, workshopId!)
                    )
                );
        }

        if (result.length === 0) {
            return NextResponse.json(
                { message: "Registration not found", status: 404 },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: result[0], status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Internal server error", status: 500 },
            { status: 500 }
        );
    }
}
