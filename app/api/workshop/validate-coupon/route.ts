import { withApiLogging } from "@/lib/logging/api";
import { createLogger } from "@/lib/logging/logger";
import { getCouponCodeDetails } from "@/helper/workshop/getCouponCodeDetails";

const logger = createLogger("api", "app/api/workshop/validate-coupon/route.ts");

export const POST = withApiLogging(
  "/app/api/workshop/validate-coupon",
  async function POST(req: Request) {
    try {
      const body = await req.json();
      const { couponCode, workshopId } = body;
      const data = await getCouponCodeDetails(couponCode, workshopId);
      return Response.json({ status: 200, data: data });
    } catch (error: any) {
      logger.error("app/api/workshop/validate-coupon/route.ts: diagnostic", {
        details: [error],
      });
      return Response.json({ status: 400, message: error.message });
    }
  },
);
