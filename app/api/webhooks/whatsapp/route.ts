export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const verificationKey = process.env.WHATSAPP_WEBHOOK_KEY;

  // Keep the verification token out of the logs.
  console.log("[WhatsApp webhook] Verification request", { mode, challenge });

  if (!verificationKey) {
    return new Response("Webhook verification is not configured", { status: 500 });
  }

  if (mode !== "subscribe" || token !== verificationKey || !challenge) {
    return new Response("Forbidden", { status: 403 });
  }

  return new Response(challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  console.log("[WhatsApp webhook] Incoming request", body);

  return new Response("EVENT_RECEIVED", { status: 200 });
}
