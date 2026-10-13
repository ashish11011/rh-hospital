"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SignedCourseVideo from "@/components/course/SignedCourseVideo";

export function CourseMediaPreview({ courseId, itemId, email, label }: { courseId: string; itemId: string; email: string; label: string }) {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><button type="button" className="block max-w-64 truncate text-left text-primary underline">{label}</button></DialogTrigger>
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader><DialogTitle>Course media preview</DialogTitle></DialogHeader>
      {open && <SignedCourseVideo courseId={courseId} itemId={itemId} email={email} initialProgress={0} preview />}
    </DialogContent>
  </Dialog>;
}
