import "server-only";
import {
  createLogContext,
  getServerLogContext,
  logContext,
  rememberErrorContext,
  operationLogScope,
} from "./context";
import { createLogger } from "./logger";
import { statusLevel, type LogCategory } from "./shared";
import { diagnosticsEnabled } from "./policy";

function isControlFlow(error: unknown) {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return (
    typeof digest === "string" &&
    /^(NEXT_REDIRECT|NEXT_HTTP_ERROR_FALLBACK|DYNAMIC_SERVER_USAGE|NEXT_PRERENDER_INTERRUPTED)/.test(
      digest,
    )
  );
}

/** No arguments or return payloads are logged. Existing redirects/errors pass through unchanged. */
export async function runLoggedOperation<T>(
  category: LogCategory,
  source: string,
  operation: () => Promise<T>,
  requestAware = true,
): Promise<T> {
  let context = logContext.getStore();
  if (!context && requestAware) context = await getServerLogContext();
  context ??= createLogContext();
  const scope = { failures: 0, parent: operationLogScope.getStore() };
  return logContext.run(context, () =>
    operationLogScope.run(scope, async () => {
      const logger = createLogger(category, source);
      const started = performance.now();
      logger.diagnostic("Operation started");
      try {
        const result = await operation();
        const outcome =
          result && typeof result === "object"
            ? (result as { error?: unknown; success?: boolean })
            : undefined;
        const status = result instanceof Response ? result.status : undefined;
        const level = status
          ? statusLevel(status)
          : outcome?.error || outcome?.success === false
            ? "warning"
            : "info";
        const metadata = {
          status,
          durationMs: Math.round(performance.now() - started),
        };
        if (level === "info")
          logger.diagnostic("Operation completed", metadata);
        else if (scope.failures === 0 || diagnosticsEnabled())
          logger[level]("Operation returned a failure", metadata);
        return result;
      } catch (error) {
        rememberErrorContext(error, context);
        const cause = error as {
          status?: number;
          $metadata?: { httpStatusCode?: number };
        } | null;
        const status = cause?.status ?? cause?.$metadata?.httpStatusCode;
        const level = isControlFlow(error)
          ? "info"
          : typeof status === "number"
            ? statusLevel(status)
            : "error";
        const metadata = {
          error,
          durationMs: Math.round(performance.now() - started),
        };
        if (isControlFlow(error))
          logger.diagnostic("Operation transferred control", metadata);
        else logger[level]("Operation failed", metadata);
        throw error;
      }
    }),
  );
}
