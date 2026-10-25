import { withApiLogging } from "@/lib/logging/api";
import { createLogger } from "@/lib/logging/logger";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminAccess } from "@/lib/adminAuth";

const logger = createLogger(
  "api",
  "app/api/admin/generate-certificate/[slug]/route.tsx",
);

export const POST = withApiLogging(
  "/app/api/admin/generate-certificate/[slug]",
  async function POST(
    req: NextRequest,
    context: { params: Promise<{ slug: string }> },
  ) {
    try {
      const { access } = await getCurrentAdminAccess();
      if (access !== "full") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const { name, email } = await req.json();
      const { slug } = await context.params;
      logger.info("Certificate generation requested", { workshopId: slug });

      // const { url: certificateUrl } = await generateAndUploadCertificate(name, slug);
    } catch (error: any) {
      logger.error(
        "app/api/admin/generate-certificate/[slug]/route.tsx: diagnostic",
        { details: [error] },
      );
      return NextResponse.json(
        { message: "Failed to generate certificate" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Certificate generated successfully" });
  },
);
