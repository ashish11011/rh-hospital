import { conversationMessage, whatsappConversation } from "@/db";
import { db } from "@/lib/dbConfig";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// POST /api/wp/conversation/messages
// Body: { conversationId, role, message }
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
