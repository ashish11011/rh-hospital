import "server-only";
import { after } from "next/server";
import {
  createLogContext,
  logContext,
  rememberErrorContext,
  operationLogScope,
} from "./context";
import { diagnosticsEnabled } from "./policy";
import {
  sanitize,
  type LogCategory,
  type LogEntry,
  type LogLevel,
  type LogMetadata,
} from "./shared";

const pending: LogEntry[] = [];
let flushing: Promise<void> | undefined;

/** Find exception references without serializing their messages or changing the exception. */
function errorReferences(
  value: unknown,
  seen = new WeakSet<object>(),
  depth = 0,
): object[] {
  if (!value || typeof value !== "object" || seen.has(value) || depth > 4)
    return [];
  seen.add(value);
  const nested = Object.entries(value).flatMap(([key, item]) => {
    const references = errorReferences(item, seen, depth + 1);
    return /error|cause|^err$/i.test(key) && item && typeof item === "object"
      ? [item, ...references]
      : references;
  });
  return value instanceof Error ? [value, ...nested] : nested;
}

/** Await explicitly in non-request jobs and instrumentation error hooks. Never throws. */
export async function flushLogs(): Promise<void> {
  if (flushing) {
    await flushing;
    if (pending.length) await flushLogs();
    return;
  }
  if (!pending.length) return;
  const batch = pending.splice(0, pending.length);
  flushing = (async () => {
    try {
      const { sendToCloudWatch } = await import("./cloudwatch");
      await sendToCloudWatch(batch);
    } catch {
      // Preserve sanitized records on transport/configuration failure without failing user work.
      console.log(
        JSON.stringify({
          ...batch[0],
          timestamp: new Date().toISOString(),
          level: "error",
          category: "integration",
          source: "logging/cloudwatch",
          message: "CloudWatch delivery failed; using console fallback",
          metadata: { eventCount: batch.length },
        }),
      );
      for (const entry of batch) console.log(JSON.stringify(entry));
    }
  })();
  try {
    await flushing;
  } finally {
    flushing = undefined;
  }
  if (pending.length) await flushLogs();
}

function write(
  level: LogLevel,
  category: LogCategory,
  source: string,
  message: string,
  metadata: LogMetadata,
  summary = false,
) {
  try {
    const context = logContext.getStore() || createLogContext();
    const errors = level !== "info" ? errorReferences(metadata) : [];
    if (
      !summary &&
      !diagnosticsEnabled() &&
      errors.length &&
      errors.every((error) => context.reportedErrors?.has(error))
    )
      return;
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      source,
      message: String(sanitize(message)),
      requestId: context.requestId,
      requestIdSource: context.requestIdSource,
      method: context.method,
      route: context.route,
      metadata: sanitize(metadata),
    };
    if (Buffer.byteLength(JSON.stringify(entry), "utf8") > 20_000)
      entry.metadata = { truncated: true };
    if (level !== "info") {
      // Propagate failures through this operation's ancestors, never to parallel siblings.
      let scope = operationLogScope.getStore();
      while (scope) {
        scope.failures++;
        scope = scope.parent;
      }
      context.reportedErrors ??= new WeakSet<object>();
      for (const error of errors) {
        context.reportedErrors.add(error);
        rememberErrorContext(error, context);
      }
    }
    if (process.env.NODE_ENV !== "production") {
      console.log(JSON.stringify(entry));
      return;
    }
    if (pending.length >= 2000) {
      // Bounded memory during an outage; preserve overflow in the platform's console.
      console.log(JSON.stringify(entry));
      return;
    }
    pending.push(entry);
    if (!context.flushScheduled) {
      context.flushScheduled = true;
      try {
        after(flushLogs);
      } catch {
        context.flushScheduled = false;
        void flushLogs();
      } // Non-request callers can also await flushLogs().
    }
  } catch {
    // Observability must not change payment, authentication, or response behavior.
  }
}

export function createLogger(category: LogCategory, source: string) {
  return {
    // Diagnostics are still info-level records; this does not introduce a fourth severity.
    diagnostic: (message: string, metadata: LogMetadata = {}) => {
      if (diagnosticsEnabled())
        write("info", category, source, message, metadata);
    },
    summary: (level: LogLevel, message: string, metadata: LogMetadata = {}) =>
      write(level, category, source, message, metadata, true),
    info: (message: string, metadata: LogMetadata = {}) =>
      write("info", category, source, message, metadata),
    warning: (message: string, metadata: LogMetadata = {}) =>
      write("warning", category, source, message, metadata),
    error: (message: string, metadata: LogMetadata = {}) =>
      write("error", category, source, message, metadata),
  };
}
