import "server-only";
import type { MiddlewareStack } from "@smithy/types";
import { runLoggedOperation } from "./operations";

/** Log the SDK operation/outcome, never command input, output or credentials. */
export function instrumentAwsClient<
  Input extends object,
  Output extends object,
>(client: { middlewareStack: MiddlewareStack<Input, Output> }, source: string) {
  client.middlewareStack.add(
    (next, context) => async (args) => {
      return runLoggedOperation(
        "integration",
        `${source}.${context.commandName || "command"}`,
        () => next(args),
      );
    },
    { step: "initialize", name: "structuredLogging" },
  );
}
