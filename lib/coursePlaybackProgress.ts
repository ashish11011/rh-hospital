// Keep writes in order, including a final save queued while a periodic save is pending.
export function createProgressSaver(
  courseId: string,
  courseItemId: string,
  onError: (failed: boolean) => void,
) {
  let pending: { progress: number; duration: number } | undefined;
  let saving = false;
  let lastSaved = -1;

  async function flush() {
    if (saving) return;
    saving = true;
    try {
      while (pending) {
        const snapshot = pending;
        pending = undefined;
        if (snapshot.progress === lastSaved) continue;
        try {
          const response = await fetch(`/api/auth/mobile/courses/${encodeURIComponent(courseId)}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            keepalive: true,
            body: JSON.stringify({ courseItemId, ...snapshot }),
          });
          if (!response.ok) throw new Error('Progress save failed');
          lastSaved = snapshot.progress;
          onError(false);
        } catch {
          onError(true);
          // The next playback event retries; don't mark unsuccessful writes as saved.
        }
      }
    } finally {
      saving = false;
    }
  }

  return (progress: number, duration: number) => {
    if (!Number.isFinite(progress) || progress < 0 || !Number.isFinite(duration) || duration <= 0) return;
    pending = { progress: Math.floor(Math.min(progress, duration)), duration: Math.floor(duration) };
    void flush();
  };
}
