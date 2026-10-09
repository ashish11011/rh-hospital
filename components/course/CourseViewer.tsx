"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  ListVideo,
  Play,
  ShieldCheck,
} from "lucide-react";
import { CourseItemBanner } from "./CourseItemBanner";
import { Button } from "@/components/ui/button";

const VideoPlayer = dynamic(() => import("./VideoPlayer"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video animate-pulse rounded-xl bg-slate-900" />
  ),
});
type Lesson = {
  id: string;
  title: string;
  type: string;
  duration: string | null;
  progress: number;
};
const isVideoLesson = (item: Lesson) =>
  item.type === "application/x-mpegURL" || item.type === "video/mp4";

export default function CourseViewer({
  items,
  email,
  courseId,
  initialItemId,
}: {
  items: Lesson[];
  email: string;
  courseId: string;
  initialItemId?: string;
}) {
  const [selectedId, setSelectedId] = useState(
    items.find((item) => item.id === initialItemId)?.id ?? items[0]?.id,
  );
  const positions = useRef(
    new Map(items.map((item) => [item.id, item.progress])),
  );
  const selectedIndex = items.findIndex((item) => item.id === selectedId);
  const selected = items[selectedIndex];
  if (!selected)
    return (
      <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
        <BookOpen className="mx-auto mb-3 size-8 text-slate-400" />
        <p className="text-slate-600">
          Lessons will appear here when they are published.
        </p>
      </div>
    );
  const isVideo = isVideoLesson(selected);
  const videoCount = items.filter(isVideoLesson).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Item{" "}
          <span className="font-semibold text-slate-900">
            {selectedIndex + 1}
          </span>{" "}
          of {items.length}
          <span className="mx-2 text-slate-300">/</span>
          {isVideo ? "Video lesson" : "Course resource"}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <section className="w-full min-w-0" aria-label="Selected lesson">
          {isVideo ? (
            <VideoPlayer
              key={selected.id}
              courseId={courseId}
              itemId={selected.id}
              initialProgress={positions.current.get(selected.id) ?? 0}
              onProgress={(seconds) =>
                positions.current.set(selected.id, seconds)
              }
              src={`/api/course/media/${selected.id}`}
              type={selected.type}
              email={email}
            />
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center sm:aspect-video">
              <div className="text-primary mb-4 rounded-2xl bg-emerald-50 p-4">
                <FileText className="size-9" />
              </div>
              <p className="mb-2 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                {selected.type} resource
              </p>
              <h2 className="mb-6 text-xl font-semibold">{selected.title}</h2>
              <Button asChild>
                <a
                  href={`/api/course/media/${selected.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open resource
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>
          )}
          <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-primary mb-2 text-xs font-semibold tracking-widest uppercase">
                  {isVideo ? "Now watching" : "Selected resource"}
                </p>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  {selected.title}
                </h2>
                {selected.duration && (
                  <p className="mt-2 text-sm text-slate-500">
                    {selected.duration}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedIndex === 0}
                  onClick={() => setSelectedId(items[selectedIndex - 1].id)}
                  aria-label="Previous course item"
                >
                  <ArrowLeft className="size-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedIndex === items.length - 1}
                  onClick={() => setSelectedId(items[selectedIndex + 1].id)}
                  aria-label="Next course item"
                >
                  <span>Next</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
            {isVideo && (
              <p className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
                <ShieldCheck className="size-4 shrink-0 text-slate-400" />
                For your personal learning. Your email address is displayed on
                the video.
              </p>
            )}
          </div>
        </section>
        <nav
          id="course-content"
          aria-label="Course lessons"
          className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
        >
          <div className="border-b border-slate-100 p-5">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <ListVideo className="text-primary size-5" />
              Course content
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">
              {videoCount} videos · {items.length - videoCount} resources
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => {
              const active = item.id === selected.id;
              const Icon = isVideoLesson(item) ? Play : FileText;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => setSelectedId(item.id)}
                  className={`group focus-visible:outline-primary flex w-full flex-col gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${active ? "border-emerald-200 bg-emerald-50" : "border-transparent hover:bg-slate-50"}`}
                >
                  <CourseItemBanner title={item.title} />
                  <span className="flex items-center gap-3">
                    <span
                      className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-sm leading-5 font-medium ${active ? "text-emerald-900" : "text-slate-700"}`}
                      >
                        Item {index + 1}
                      </span>
                      <span
                        className={`mt-1.5 block text-xs ${active ? "text-emerald-700" : "text-slate-400"}`}
                      >
                        {isVideoLesson(item) ? "Video" : "Resource"}
                        {item.duration ? ` · ${item.duration}` : ""}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
