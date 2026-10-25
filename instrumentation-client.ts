import { createClientLogger } from "@/lib/logging/client";

const logger = createClientLogger("service", "browser/runtime");

window.addEventListener("error", (event) => {
  logger.error("Unhandled browser error", { error: event.error });
});

window.addEventListener("unhandledrejection", (event) => {
  logger.error("Unhandled browser rejection", { error: event.reason });
});
