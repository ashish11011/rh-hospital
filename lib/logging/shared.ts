export type LogCategory = "api" | "resources" | "service" | "integration";
export type LogLevel = "info" | "warning" | "error";
export type LogMetadata = Record<string, unknown>;

const sensitiveKey =
  /authorization|cookie|password|secret|token|credential|private.?key|api.?key|access.?key|email|phone|mobile|address|recipient|payload|body|headers|query|params|responseObject|signed|certificate|customerName|first_name|last_name|message|stack|reason/i;

function safeText(value: string) {
  return value
    .replace(/\b(Bearer|Basic)\s+[^\s,;]+/gi, "$1 [REDACTED]")
    .replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/g, "[REDACTED]")
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[REDACTED]")
    .replace(/([?&][^=\s]+)=([^&\s]+)/g, "$1=[REDACTED]")
    .slice(0, 1500);
}

/** Never serialize error messages/stacks: database/provider errors can contain input or SQL. */
export function sanitize(
  value: unknown,
  seen = new WeakSet<object>(),
  depth = 0,
): unknown {
  if (depth > 5) return "[TRUNCATED]";
  if (
    value === null ||
    value === undefined ||
    typeof value === "boolean" ||
    typeof value === "number"
  )
    return value;
  if (typeof value === "string") return safeText(value);
  if (typeof value === "bigint") return value.toString();
  if (typeof value !== "object") return "[UNSUPPORTED]";
  if (seen.has(value)) return "[CIRCULAR]";
  seen.add(value);
  if (value instanceof Error) {
    const error = value as Error & {
      code?: unknown;
      status?: unknown;
      digest?: unknown;
    };
    return {
      name: safeText(error.name),
      code: sanitize(error.code, seen, depth + 1),
      status: sanitize(error.status, seen, depth + 1),
      digest: sanitize(error.digest, seen, depth + 1),
    };
  }
  if (value instanceof Date)
    return Number.isFinite(value.getTime())
      ? value.toISOString()
      : "Invalid Date";
  if (Array.isArray(value))
    return value.slice(0, 20).map((item) => sanitize(item, seen, depth + 1));
  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 40)
      .map(([key, item]) => [
        key,
        sensitiveKey.test(key) ? "[REDACTED]" : sanitize(item, seen, depth + 1),
      ]),
  );
}

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  source: string;
  message: string;
  requestId: string;
  requestIdSource: "uuid" | "x-vercel-id";
  method?: string;
  route?: string;
  metadata: unknown;
};

export function statusLevel(status: number): LogLevel {
  return status >= 500 ? "error" : status >= 400 ? "warning" : "info";
}
