/** Verbose diagnostics stay on in development and off in production unless explicitly enabled. */
export function diagnosticsEnabled() {
  const setting = process.env.LOG_DIAGNOSTICS;
  return (
    setting === "true" ||
    (setting !== "false" && process.env.NODE_ENV !== "production")
  );
}
