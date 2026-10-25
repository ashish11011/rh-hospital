import { withApiLogging } from "@/lib/logging/api";
import { createLogger } from "@/lib/logging/logger";

const logger = createLogger("api", "app/api/webhooks/whatsapp/route.ts");

export const GET = withApiLogging(
  "/app/api/webhooks/whatsapp",
  async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");
    const verificationKey = process.env.WHATSAPP_WEBHOOK_KEY;

    // Keep the verification token out of the logs.
    logger.diagnostic("WhatsApp webhook verification requested", {
      mode,
      hasChallenge: !!challenge,
    });

    if (!verificationKey) {
      return new Response("Webhook verification is not configured", {
        status: 500,
      });
    }

    if (mode !== "subscribe" || token !== verificationKey || !challenge) {
      return new Response("Forbidden", { status: 403 });
    }

    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
);

export const POST = withApiLogging(
  "/app/api/webhooks/whatsapp",
  async function POST(request: Request) {
    const body = await request.text();
    logger.diagnostic("WhatsApp webhook received", {
      byteLength: Buffer.byteLength(body, "utf8"),
    });

    return new Response("EVENT_RECEIVED", { status: 200 });
  },
);
