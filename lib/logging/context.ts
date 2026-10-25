import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { cache } from "react";
import type { LogEntry } from "./shared";

export type LogContext = Pick<
  LogEntry,
  "requestId" | "requestIdSource" | "method" | "route"
> & {
  flushScheduled?: boolean;
  reportedErrors?: WeakSet<object>;
};

export const logContext = new AsyncLocalStorage<LogContext>();
export type OperationLogScope = {
  failures: number;
  parent?: OperationLogScope;
};
export const operationLogScope = new AsyncLocalStorage<OperationLogScope>();
const errorContexts = new WeakMap<object, LogContext>();

export function rememberErrorContext(error: unknown, context: LogContext) {
  if (error && typeof error === "object") errorContexts.set(error, context);
}

export function getErrorContext(error: unknown) {
  return error && typeof error === "object"
    ? errorContexts.get(error)
    : undefined;
}

export function hasReportedError(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    !!logContext.getStore()?.reportedErrors?.has(error)
  );
}

export function createLogContext(
  headers?: Pick<Headers, "get">,
  extra: Pick<LogContext, "method" | "route"> = {},
): LogContext {
  const vercelId =
    process.env.NODE_ENV === "production"
      ? headers?.get("x-vercel-id")?.trim()
      : undefined;
  // Header values are untrusted; bound their size and exclude control characters.
  const validId =
    vercelId && vercelId.length <= 256 && /^[\w:./-]+$/.test(vercelId);
  return {
    requestId: validId ? vercelId : randomUUID(),
    requestIdSource: validId ? "x-vercel-id" : "uuid",
    ...extra,
  };
}

// React cache keeps one context across server actions/components in the same request.
export const getServerLogContext = cache(async () => {
  const { headers } = await import("next/headers");
  try {
    return createLogContext(await headers());
  } catch (error) {
    // Background jobs have no HTTP headers. Next's prerender/control-flow signals must propagate.
    if (
      error instanceof Error &&
      /outside a request scope/i.test(error.message)
    )
      return createLogContext();
    throw error;
  }
});
