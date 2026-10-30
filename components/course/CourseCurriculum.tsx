"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock3,
  FileText,
  Presentation,
  Video,
  Headphones,
  Link2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  COURSE_ITEM_ACCESS_LABELS,
  type CourseItemAccessType,
} from "@/lib/courseItemAccess";
import SignedCourseVideo from "./SignedCourseVideo";

export type CurriculumItem = {
  id: string;
  moduleNumber: number;
  lectureName: string;
  duration: string;
  mediaType: string;
  isVideo: boolean;
  accessType: CourseItemAccessType;
  canAccess: boolean;
};

export default function CourseCurriculum({
  items,
  courseId,
  coursePath,
  email,
}: {
  items: CurriculumItem[];
  courseId: string;
  coursePath: string;
  email: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<CurriculumItem | null>(null);
  const [restrictedItem, setRestrictedItem] = useState<CurriculumItem | null>(
    null,
  );

  function openItem(item: CurriculumItem) {
    if (!email) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(coursePath)}`);
    } else if (!item.canAccess) {
      setRestrictedItem(item);
    } else {
      setSelected(item);
    }
  }
  return (
    <>
      <ol className="divide-border bg-card divide-y overflow-hidden rounded-2xl border">
        {items.map((chapter) => {
          const media = getMediaPresentation(chapter.mediaType);
          const Icon = media.icon;
          return (
            <li
              key={chapter.id}
              className="flex flex-wrap items-start gap-4 p-5 sm:items-center sm:p-6"
            >
              <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  {String(chapter.moduleNumber).padStart(2, "0")} ·{" "}
                  {media.label}
                </p>
                <h4 className="text-foreground text-base leading-6 font-medium break-words">
                  {chapter.canAccess && !chapter.isVideo ? (
                    <a
                      href={`/api/course/media/${chapter.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary focus-visible:outline-primary rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      {chapter.lectureName}
                    </a>
                  ) : chapter.canAccess || chapter.accessType !== "paid" ? (
                    <button
                      type="button"
                      className="hover:text-primary focus-visible:outline-primary cursor-pointer rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-4"
                      onClick={() => openItem(chapter)}
                    >
                      {chapter.lectureName}
                    </button>
                  ) : (
                    chapter.lectureName
                  )}
                </h4>
                <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="sr-only">Duration: </span>
                    {chapter.duration}
                  </span>
                  {chapter.accessType !== "paid" && (
                    <Badge
                      variant="secondary"
                      className={
                        chapter.accessType === "free"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : undefined
                      }
                    >
                      {COURSE_ITEM_ACCESS_LABELS[chapter.accessType]}
                    </Badge>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selected?.lectureName}</DialogTitle>
            <DialogDescription>
              Watch this lesson here on the course page.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <SignedCourseVideo
              key={selected.id}
              courseId={courseId}
              itemId={selected.id}
              email={email}
              initialProgress={0}
              preview
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(restrictedItem)}
        onOpenChange={(open) => {
          if (!open) setRestrictedItem(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {restrictedItem?.accessType === "free_for_members"
                ? "RH membership required"
                : "Unable to access this item"}
            </DialogTitle>
            <DialogDescription>
              {restrictedItem?.accessType === "free_for_members"
                ? "Please become an RH member first to access this item. You can create your RH Membership Card from your dashboard."
                : "This item is not available for your account. Please contact support for help."}
            </DialogDescription>
          </DialogHeader>
          {restrictedItem?.accessType === "free_for_members" && (
            <Button asChild>
              <Link href="/dashboard/id-card">Create RH Membership Card</Link>
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function getMediaPresentation(mediaType: string) {
  const type = mediaType.toLowerCase().trim();
  if (type.includes("pdf")) return { label: "PDF document", icon: FileText };
  if (/ppt|powerpoint|presentation/.test(type))
    return { label: "Presentation", icon: Presentation };
  if (/video|mp4|webm|mov|m4v/.test(type))
    return { label: "Video", icon: Video };
  if (/audio|mp3|wav/.test(type)) return { label: "Audio", icon: Headphones };
  if (type === "link") return { label: "Link", icon: Link2 };
  return { label: "Document", icon: FileText };
}
