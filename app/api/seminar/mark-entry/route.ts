import { seminarRegistrations } from "@/db";
import { db } from "@/lib/dbConfig";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    try {
        const [updated] = await db
            .update(seminarRegistrations)
            .set({ isFirstDayLogged: true })
            .where(eq(seminarRegistrations.id, id))
            .returning({ id: seminarRegistrations.id });

        if (!updated) {
            return NextResponse.json({ message: "Registration not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Entry marked successfully" });
    } catch (error) {
        console.error("Mark entry error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
