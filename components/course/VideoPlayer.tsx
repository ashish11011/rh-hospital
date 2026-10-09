"use client";

import { useEffect, useRef, useState } from "react";
import { createProgressSaver } from "@/lib/coursePlaybackProgress";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "videojs-contrib-eme";
import "videojs-mobile-ui";
import "videojs-seek-buttons";
import "videojs-sprite-thumbnails";
import "video.js/dist/video-js.css";
import "videojs-mobile-ui/dist/videojs-mobile-ui.css";
import "videojs-seek-buttons/dist/videojs-seek-buttons.css";
import "./video-player.css";

type CoursePlayer = Player & {
  eme: () => void;
  mobileUi: (options: object) => void;
  seekButtons: (options: { forward: number; back: number }) => void;
  spriteThumbnails: (options: {
    url: string;
    width: number;
    height: number;
    columns: number;
    interval: number;
  }) => void;
};

type Props = {
  courseId: string;
  itemId: string;
  initialProgress: number;
  onProgress: (seconds: number) => void;
  src: string;
  type: string;
  email: string;
  sprite?: {
    url: string;
    width: number;
    height: number;
    columns: number;
    interval: number;
  };
};

export default function VideoPlayer({
  src,
  type,
  email,
  sprite,
  courseId,
  itemId,
  initialProgress,
  onProgress,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const resumePosition = useRef(initialProgress);
  const progressCallback = useRef(onProgress);
  useEffect(() => {
    progressCallback.current = onProgress;
  }, [onProgress]);
  const [progressError, setProgressError] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const video = document.createElement("video-js");
    video.classList.add("video-js", "vjs-big-play-centered");
    video.setAttribute("playsinline", "");
    host.appendChild(video);
    const player = videojs(video, {
      controls: true,
      fluid: true,
      aspectRatio: "16:9",
      preload: "metadata",
      playsinline: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      // Full-window fallback keeps the watermark on iPhones without element fullscreen.
      preferFullWindow: true,
      enableDocumentPictureInPicture: false,
      controlBar: { pictureInPictureToggle: false },
    }) as CoursePlayer;
    player.eme();
    player.mobileUi({
      fullscreen: { disabled: true },
      touchControls: { seekSeconds: 10 },
    });
    player.seekButtons({ forward: 10, back: 10 });
    if (sprite) player.spriteThumbnails(sprite);
    const tech = player.el().querySelector("video");
    tech?.setAttribute("disablePictureInPicture", "");
    tech?.setAttribute("disableRemotePlayback", "");
    tech?.setAttribute("controlsList", "nodownload noremoteplayback");
    // Append inside Video.js so element fullscreen includes the watermark.
    const watermark = document.createElement("div");
    watermark.className = "course-watermark";
    watermark.textContent = email;
    watermark.setAttribute("aria-hidden", "true");
    player.el().appendChild(watermark);
    let position = 0;
    const positions = [
      [8, 12],
      [62, 25],
      [30, 65],
      [65, 60],
      [12, 45],
    ];
    const move = () => {
      const [x, y] = positions[position++ % positions.length];
      const bounds = player.el().getBoundingClientRect();
      watermark.style.left = `${Math.max(0, Math.min((bounds.width * x) / 100, bounds.width - watermark.offsetWidth - 8))}px`;
      watermark.style.top = `${Math.max(0, Math.min((bounds.height * y) / 100, bounds.height - watermark.offsetHeight - 48))}px`;
    };
    move();
    const timer = window.setInterval(move, 8000);
    const resize = new ResizeObserver(move);
    resize.observe(player.el());
    let restored = false;
    let hasPlayed = false;
    let disposed = false;
    let lastSync = Date.now();
    const save = createProgressSaver(courseId, itemId, (failed) => {
      if (!disposed) setProgressError(failed);
    });
    const restore = () => {
      if (restored) return;
      const duration = player.duration();
      if (!duration || !Number.isFinite(duration)) return;
      const seconds = Math.min(Math.max(0, resumePosition.current), duration);
      restored = true;
      if (seconds > 0) player.currentTime(seconds);
    };
    const capture = () => {
      if (!restored || !hasPlayed) return;
      const seconds = player.currentTime();
      if (seconds === undefined || !Number.isFinite(seconds)) return;
      resumePosition.current = seconds;
      progressCallback.current(seconds);
      return seconds;
    };
    const sync = () => {
      const seconds = capture();
      if (seconds !== undefined) save(seconds, player.duration() ?? 0);
      lastSync = Date.now();
    };
    const visibilityChange = () => {
      if (document.visibilityState === "hidden") sync();
    };
    player.on("loadedmetadata", restore);
    player.on("durationchange", restore);
    player.on("canplay", restore);
    player.on("playing", () => {
      restore();
      hasPlayed = true;
    });
    player.on("timeupdate", () => {
      capture();
      if (!player.paused() && Date.now() - lastSync >= 30000) sync();
    });
    player.on("pause", sync);
    player.on("seeked", sync);
    player.on("ended", sync);
    document.addEventListener("visibilitychange", visibilityChange);
    window.addEventListener("pagehide", sync);
    player.on("error", () => setError(true));
    player.src({ src, type });
    return () => {
      sync();
      disposed = true;
      document.removeEventListener("visibilitychange", visibilityChange);
      window.removeEventListener("pagehide", sync);
      window.clearInterval(timer);
      resize.disconnect();
      player.dispose();
    };
  }, [src, type, email, sprite, attempt, courseId, itemId]);
  return (
    <div
      className="course-video overflow-hidden rounded-xl bg-slate-950"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div ref={container} />
      {progressError && (
        <p role="status" className="p-3 text-sm text-amber-200">
          Unable to save playback progress. We’ll retry while you watch.
        </p>
      )}
      {error && (
        <div role="alert" className="p-4 text-sm text-white">
          The video could not be loaded. Check your connection and course
          access.
          <button
            className="ml-3 underline"
            onClick={() => {
              setError(false);
              setAttempt((value) => value + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
