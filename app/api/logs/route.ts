import { withApiLogging } from "@/lib/logging/api";
import { browserEvents } from "@/lib/logging/browser-events";
import { createLogger } from "@/lib/logging/logger";
import type { LogLevel } from "@/lib/logging/shared";
import { diagnosticsEnabled } from "@/lib/logging/policy";

let windowStart = 0;
let accepted = 0;

export const POST = withApiLogging(
  "/api/logs",
  async function POST(request: Request) {
    if (request.headers.get("origin") !== new URL(request.url).origin)
      return new Response(null, { status: 403 });
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return new Response(null, { status: 415 });
    const now = Date.now();
    if (now - windowStart >= 60_000) {
      windowStart = now;
      accepted = 0;
    }
    // Best-effort per-instance ingestion bound. This route never accepts arbitrary log text/data.
    if (accepted >= 500) return new Response(null, { status: 429 });
    const reader = request.body?.getReader();
    if (!reader) return new Response(null, { status: 400 });
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) {
        await reader.cancel();
        return new Response(null, { status: 413 });
      }
      chunks.push(value);
    }
    let event: { source?: unknown; level?: unknown; message?: unknown };
    try {
      event = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return new Response(null, { status: 400 });
    }
    if (
      !event ||
      typeof event.source !== "string" ||
      typeof event.message !== "string" ||
      !Object.hasOwn(browserEvents, event.source) ||
      !browserEvents[event.source].includes(event.message) ||
      !["info", "warning", "error"].includes(String(event.level))
    )
      return new Response(null, { status: 400 });
    if (event.level === "info" && !diagnosticsEnabled())
      return new Response(null, { status: 204 });
    accepted++;
    createLogger("service", `browser/${event.source}`)[event.level as LogLevel](
      event.message,
      { browser: true },
    );
    return new Response(null, { status: 204 });
  },
  { logSuccess: false },
);
