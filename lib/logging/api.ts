import "server-only";
import {
  createLogContext,
  logContext,
  rememberErrorContext,
  hasReportedError,
} from "./context";
import { createLogger } from "./logger";
import { diagnosticsEnabled } from "./policy";
import { statusLevel } from "./shared";
import { checkPublicApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";

/** Preserve Next's exact handler signature, including promised dynamic params. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withApiLogging<T extends (...args: any[]) => Promise<Response>>(
  route: string,
  handler: T,
  options: { logSuccess?: boolean; logStart?: boolean } = {},
): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as Request;
    const context = createLogContext(request.headers, {
      method: request.method,
      route,
    });
    return logContext.run(context, async () => {
      const logger = createLogger("api", route);
      const started = performance.now();
      if (options.logStart !== false) logger.diagnostic("Request started");
      try {
        let blocked: Response | null = null;
        try {
          await checkPublicApiRateLimit(route, request);
        } catch (error) {
          blocked = rateLimitResponse(error);
          if (!blocked) throw error;
        }
        const response = blocked || (await handler(...args));
        if (
          response.status >= 400 ||
          options.logSuccess !== false ||
          diagnosticsEnabled()
        )
          logger.summary(statusLevel(response.status), "Request completed", {
            status: response.status,
            durationMs: Math.round(performance.now() - started),
          });
        // All existing responses, cookies, redirects and streamed bodies are preserved.
        try {
          response.headers.set("x-request-id", context.requestId);
        } catch {
          /* Immutable provider response. */
        }
        return response;
      } catch (error) {
        rememberErrorContext(error, context);
        const digest = (error as { digest?: string } | null)?.digest;
        const controlFlow =
          typeof digest === "string" && digest.startsWith("NEXT_");
        logger.summary(
          controlFlow ? "info" : "error",
          controlFlow ? "Request transferred control" : "Request failed",
          {
            status: controlFlow ? undefined : 500,
            ...(!controlFlow && !hasReportedError(error) ? { error } : {}),
            durationMs: Math.round(performance.now() - started),
          },
        );
        throw error;
      }
    });
  }) as T;
}
