// Keep identical to my-app/lib/courseGrantLifecycle.ts; neither platform has a shared package.
export type ExpiringCourseGrant = { expiresAt: number };
export type CourseGrantFailure = Error & { status?: number };

/** One grant/renewal request at a time. Expiry stops playback even during a hung request. */
export function createCourseGrantLifecycle<T extends ExpiringCourseGrant>(options: {
  request: () => Promise<T>;
  install: (grant: T) => void | Promise<void>;
  unavailable: (error: CourseGrantFailure) => void;
}) {
  let disposed = false;
  let denied = false;
  let pending: Promise<void> | null = null;
  let grant: T | null = null;
  let renewal: ReturnType<typeof setTimeout> | undefined;
  let expiry: ReturnType<typeof setTimeout> | undefined;
  const clear = () => { clearTimeout(renewal); clearTimeout(expiry); };
  const renew = (): Promise<void> => {
    if (disposed || denied) return Promise.resolve();
    if (pending) return pending;
    clearTimeout(renewal);
    pending = (async () => {
      let installing = false;
      try {
        const next = await options.request();
        if (disposed) return;
        if (!Number.isFinite(next.expiresAt) || next.expiresAt * 1000 <= Date.now()) throw new Error("Course access has expired");
        clear();
        grant = next;
        expiry = setTimeout(() => {
          if (disposed || denied) return;
          grant = null;
          options.unavailable(new Error("Course access has expired. Reconnecting…"));
          void renew();
        }, Math.max(0, next.expiresAt * 1000 - Date.now()));
        installing = true;
        await options.install(next);
        installing = false;
        if (disposed) return;
        renewal = setTimeout(() => { void renew(); }, Math.max(1000, next.expiresAt * 1000 - Date.now() - 300_000));
      } catch (cause) {
        if (disposed) return;
        const error: CourseGrantFailure = cause instanceof Error ? cause : new Error("Unable to load course access");
        denied = error.status !== undefined && error.status >= 400 && error.status < 500 && error.status !== 429;
        if (installing || denied || !grant || grant.expiresAt * 1000 <= Date.now()) {
          grant = null;
          clearTimeout(expiry);
          options.unavailable(error);
        }
        if (denied) clear();
        else renewal = setTimeout(() => { void renew(); }, 30_000);
      } finally { pending = null; }
    })();
    return pending;
  };
  return {
    renew,
    foreground: () => {
      if (grant && grant.expiresAt * 1000 <= Date.now()) {
        grant = null;
        options.unavailable(new Error("Course access has expired. Reconnecting…"));
      }
      return renew();
    },
    dispose: () => { disposed = true; grant = null; clear(); },
  };
}
