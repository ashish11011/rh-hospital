import { whatsappConversation, conversationMessage } from "@/db";
import { db } from "@/lib/dbConfig";
import { and, desc, eq, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/wp/conversation?mobileNumber=...&limit=20
// Returns conversationId + messages. Creates a new conversation if none exists in the last 7 days.
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mobileNumber = searchParams.get("mobileNumber");

    if (!mobileNumber) {
        return NextResponse.json(
            { message: "Missing 'mobileNumber' query parameter", status: 400 },
            { status: 400 }
        );
    }

    let limit = 20;
    const limitParam = searchParams.get("limit");
    if (limitParam) {
        const parsed = parseInt(limitParam, 10);
        if (!isNaN(parsed) && parsed > 0) {
            limit = Math.min(parsed, 100);
        }
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
            const conversation = result[0];
            const messages = await db
                .select()
                .from(conversationMessage)
                .where(eq(conversationMessage.conversationId, conversation.id))
                .orderBy(desc(conversationMessage.createdAt))
                .limit(limit);

            return NextResponse.json({ data: { conversationId: conversation.id, messages }, status: 200 });
        }

        // No recent conversation found — create a new one
        const [newConversation] = await db
            .insert(whatsappConversation)
            .values({ mobileNumber })
            .returning();

        return NextResponse.json({ data: { conversationId: newConversation.id, messages: [] }, status: 201 }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error", status: 500 },
            { status: 500 }
        );
    }
}
