import { user } from "@/db";
import { db } from "@/lib/dbConfig";
import { ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const number = searchParams.get("number");
    const email = searchParams.get("email");

    if (!number && !email) {
        return NextResponse.json(
            { message: "Missing 'number' or 'email' query parameter", status: 400 },
            { status: 400 }
        );
    }

    const whereCondition = number
        ? ilike(user.mobileNumber, `%${number}%`)
        : ilike(user.email, `%${email}%`);

    try {
        const result = await db
            .select({
                id: user.id,
                name: user.name,
                designation: user.designation,
                email: user.email,
            })
            .from(user)
            .where(whereCondition);

        if (result.length === 0) {
            return NextResponse.json(
                { message: "User not found", status: 404 },
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
