import { withApiLogging } from "@/lib/logging/api";
import { createLogger } from "@/lib/logging/logger";
import { workshop } from "@/db";
import { db } from "@/lib/dbConfig";
import { NextResponse } from "next/server";

const logger = createLogger("api", "app/api/wp/get_workshop_detail/route.ts");

export const GET = withApiLogging(
  "/app/api/wp/get_workshop_detail",
  async function GET() {
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
      logger.error("app/api/wp/get_workshop_detail/route.ts: diagnostic", {
        details: [error],
      });
      return NextResponse.json(
        { message: "Internal server error", status: 500 },
        { status: 500 },
      );
    }
  },
);
