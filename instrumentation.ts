import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME === "edge") return;
  const [
    { createLogContext, logContext, getErrorContext },
    { createLogger, flushLogs },
  ] = await Promise.all([
    import("./lib/logging/context"),
    import("./lib/logging/logger"),
  ]);
  const incoming = new Headers();
  const vercelId = request.headers["x-vercel-id"];
  if (typeof vercelId === "string") incoming.set("x-vercel-id", vercelId);
  await logContext.run(
    getErrorContext(error) ||
      createLogContext(incoming, {
        method: request.method,
        route: context.routePath,
      }),
    async () => {
      createLogger(
        context.routeType === "route" ? "api" : "service",
        `next/${context.routeType}`,
      ).error("Unhandled server request error", { error });
      await flushLogs();
    },
  );
};
