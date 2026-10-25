import { withApiLogging } from "@/lib/logging/api";
import { createLogger } from "@/lib/logging/logger";
import { seminarRegistrations } from "@/db";
import { db } from "@/lib/dbConfig";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const logger = createLogger(
  "api",
  "app/api/seminar/registration-status/route.ts",
);

export const GET = withApiLogging(
  "/app/api/seminar/registration-status",
  async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    try {
      const [registration] = await db
        .select({
          id: seminarRegistrations.id,
          name: seminarRegistrations.name,
          amount: seminarRegistrations.amount,
          isFirstDayLogged: seminarRegistrations.isFirstDayLogged,
          isFirstDayBreakfast: seminarRegistrations.isFirstDayBreakfast,
          isFirstDayLunch: seminarRegistrations.isFirstDayLunch,
          isSecondDayLogged: seminarRegistrations.isSecondDayLogged,
        })
        .from(seminarRegistrations)
        .where(eq(seminarRegistrations.id, id));

      if (!registration) {
        return NextResponse.json(
          { message: "Registration not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(registration);
    } catch (error) {
      logger.error("Fetch status error:", { details: [error] });
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 },
      );
    }
  },
);
