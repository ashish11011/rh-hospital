"use client";

import {
  sanitize,
  type LogCategory,
  type LogLevel,
  type LogMetadata,
} from "./shared";
import { browserEvents } from "./browser-events";

let requestId: string | undefined;
const submitted = new Map<string, number>();

/** Production submits allowlisted event names only; AWS code/credentials stay server-side. */
export function createClientLogger(category: LogCategory, source: string) {
  const write = (
    level: LogLevel,
    message: string,
    metadata: LogMetadata = {},
  ) => {
    try {
      if (process.env.NODE_ENV === "production") {
        if (level === "info") return;
        if (!browserEvents[source]?.includes(message)) return;
        const key = `${source}:${message}`;
        const now = Date.now();
        if (now - (submitted.get(key) || 0) < 5000) return;
        submitted.set(key, now);
        // Details and errors may include form data, so they never leave the browser.
        void fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          keepalive: true,
          body: JSON.stringify({ source, level, message }),
        }).catch(() => {});
        return;
      }
      requestId ??= crypto.randomUUID();
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          category,
          level,
          source,
          message,
          requestId,
          requestIdSource: "uuid",
          metadata: sanitize(metadata),
        }),
      );
    } catch {
      /* Browser diagnostics must not fail user interactions. */
    }
  };
  return {
    info: (message: string, metadata?: LogMetadata) =>
      write("info", message, metadata),
    warning: (message: string, metadata?: LogMetadata) =>
      write("warning", message, metadata),
    error: (message: string, metadata?: LogMetadata) =>
      write("error", message, metadata),
  };
}
