import "server-only";
import { runLoggedOperation } from "./operations";

/** Keep Next's fetch options/caching unchanged; don't log URLs or headers. */
export function loggedFetch(
  source: string,
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
) {
  return runLoggedOperation("integration", source, () => fetch(input, init));
}
