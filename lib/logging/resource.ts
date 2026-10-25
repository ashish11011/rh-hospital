import "server-only";
import type { Logger } from "drizzle-orm/logger";
import { createLogger } from "./logger";
import { diagnosticsEnabled } from "./policy";

const logger = createLogger("resources", "database");

/** Drizzle's hook signals dispatch, not success. SQL text and parameters are never logged. */
export const databaseLogger: Logger = {
  logQuery(query) {
    if (!diagnosticsEnabled()) return;
    const operation =
      query
        .trim()
        .match(
          /^(select|insert|update|delete|begin|commit|rollback|savepoint|release|with)\b/i,
        )?.[1]
        ?.toLowerCase() || "other";
    logger.diagnostic("Database query dispatched", { operation });
  },
};
