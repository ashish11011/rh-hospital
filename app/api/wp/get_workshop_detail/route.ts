import { workshop } from "@/db";
import { db } from "@/lib/dbConfig";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await db
            .select({
                id: workshop.id,
                name: workshop.name,
                startTime: workshop.startTime,
                endTime: workshop.endTime,
            })
            .from(workshop);

        return NextResponse.json({ data: result, status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Internal server error", status: 500 },
            { status: 500 }
        );
    }
}
