import { conversationMessage, whatsappConversation } from "@/db";
import { db } from "@/lib/dbConfig";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const limitParam = searchParams.get("limit");

    if (!conversationId) {
        return NextResponse.json(
            { message: "Missing 'conversationId' query parameter", status: 400 },
            { status: 400 }
        );
    }

    let limit = 20;
    if (limitParam) {
        const parsed = parseInt(limitParam, 10);
        if (!isNaN(parsed) && parsed > 0) {
            limit = Math.min(parsed, 100);
        }
    }

    try {
        const messages = await db
            .select()
            .from(conversationMessage)
            .where(eq(conversationMessage.conversationId, conversationId))
            .orderBy(desc(conversationMessage.createdAt))
            .limit(limit);

        return NextResponse.json({ data: messages, status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error", status: 500 },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { message: "Invalid request body", status: 400 },
            { status: 400 }
        );
    }

    const { conversationId, role, message } = body;

    if (!conversationId || !role || !message) {
        return NextResponse.json(
            { message: "Missing required fields: conversationId, role, message", status: 400 },
            { status: 400 }
        );
    }

    if (!["user", "assistant"].includes(role)) {
        return NextResponse.json(
            { message: "Invalid role. Must be 'user' or 'assistant'", status: 400 },
            { status: 400 }
        );
    }

    try {
        const [newMessage] = await db
            .insert(conversationMessage)
            .values({
                conversationId,
                role,
                message,
            })
            .returning({ id: conversationMessage.id });

        // Update the parent conversation's updatedAt timestamp
        await db
            .update(whatsappConversation)
            .set({ updatedAt: new Date() })
            .where(eq(whatsappConversation.id, conversationId));

        return NextResponse.json({ data: newMessage, status: 201 }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error", status: 500 },
            { status: 500 }
        );
    }
}
