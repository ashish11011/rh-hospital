import { withApiLogging } from "@/lib/logging/api";
import { createLogger } from "@/lib/logging/logger";
import { seminarRegistrations } from "@/db";
import { db } from "@/lib/dbConfig";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger("api", "app/api/seminar/mark-entry/route.ts");

export const POST = withApiLogging(
  "/app/api/seminar/mark-entry",
  async function POST(req: NextRequest) {
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
        return NextResponse.json(
          { message: "Registration not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ message: "Entry marked successfully" });
    } catch (error) {
      logger.error("Mark entry error:", { details: [error] });
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 },
      );
    }
  },
);
