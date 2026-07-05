import { contact } from "@/db";
import { db } from "@/lib/dbConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { name, email, message, mobileNumber, formSource } = body;
    try {
        await db.insert(contact).values({
            name, email, message, mobileNumber, formSource
        })
        return NextResponse.json({ message: "Message sent successfully", status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to send message", status: 500 })
    }
}