"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { CoursePlaybackGrant } from "@/lib/coursePlayback";
import { createCourseGrantLifecycle } from "@/lib/courseGrantLifecycle";

const VideoPlayer = dynamic(() => import("./VideoPlayer"), { ssr: false });

export default function SignedCourseVideo({ courseId, itemId, email, initialProgress, onProgress, preview = false }: {
  courseId: string; itemId: string; email: string; initialProgress: number;
  onProgress?: (seconds: number) => void; preview?: boolean;
}) {
  const [grant, setGrant] = useState<CoursePlaybackGrant | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const position = useRef(initialProgress);
  const progressCallback = useRef(onProgress);
  progressCallback.current = onProgress;
  const renewRef = useRef<(() => Promise<void>) | null>(null);
  useEffect(() => {
    let disposed = false;
    let request: AbortController | null = null;
    setGrant(null);
    setError("");
    const lifecycle = createCourseGrantLifecycle<CoursePlaybackGrant>({
      request: async () => {
        request = new AbortController();
        const timeout = setTimeout(() => request?.abort(), 15_000);
        try {
          const response = await fetch(`/api/course/${courseId}/access`, {
            method: "POST", credentials: "same-origin", cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseItemId: itemId }), signal: request.signal,
          });
          const data = await response.json();
          if (!response.ok) throw Object.assign(new Error(data.error || "Unable to access this lesson"), { status: response.status });
          if (!data.mediaUrl || !data.mediaType) throw new Error("Invalid playback response");
          return data;
        } finally { clearTimeout(timeout); }
      },
      install: next => { if (!disposed) { setGrant(next); setError(""); } },
      unavailable: failure => { if (!disposed) { setGrant(null); setError(failure.message); } },
    });
    renewRef.current = lifecycle.renew;
    void lifecycle.renew();
    const foreground = () => { if (document.visibilityState === "visible") void lifecycle.foreground(); };
    document.addEventListener("visibilitychange", foreground);
    return () => {
      disposed = true; lifecycle.dispose(); request?.abort(); renewRef.current = null;
      document.removeEventListener("visibilitychange", foreground);
    };
  }, [courseId, itemId, attempt]);
  if (!grant) return (
    <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-xl bg-slate-950 p-6 text-center text-white" role={error ? "alert" : "status"}>
      <p>{error || "Preparing course playback…"}</p>
      {error && <button className="underline" onClick={() => setAttempt(value => value + 1)}>Retry</button>}
    </div>
  );
  return <VideoPlayer courseId={courseId} itemId={itemId} email={email} src={grant.mediaUrl} type={grant.mediaType}
    initialProgress={position.current} preview={preview}
    onRetryAccess={() => renewRef.current?.()}
    onProgress={seconds => { position.current = seconds; progressCallback.current?.(seconds); }} />;
}
