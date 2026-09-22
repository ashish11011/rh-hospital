import { whatsappConversation } from "@/db";
import { db } from "@/lib/dbConfig";
import { and, desc, eq, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mobileNumber = searchParams.get("mobileNumber");

    if (!mobileNumber) {
        return NextResponse.json(
            { message: "Missing 'mobileNumber' query parameter", status: 400 },
            { status: 400 }
        );
    }
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const result = await db
            .select()
            .from(whatsappConversation)
            .where(
                and(
                    eq(whatsappConversation.mobileNumber, mobileNumber),
                    gte(whatsappConversation.updatedAt, sevenDaysAgo)
                )
            )
            .orderBy(desc(whatsappConversation.updatedAt)).limit(1);
        if (result.length > 0) {
            return NextResponse.json({ data: result[0], status: 200 });
        }
        const [newConversation] = await db
            .insert(whatsappConversation)
            .values({ mobileNumber })
            .returning();
        return NextResponse.json({ data: newConversation, status: 201 }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error", status: 500 },
            { status: 500 }
        );
    }
}
