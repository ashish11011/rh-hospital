"use client";

import { updateBlogStatus, type BlogStatus } from "@/actions/blogAdminActions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function BlogStatusSelect({ id, status }: { id: string; status: BlogStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  function changeStatus(nextStatus: BlogStatus) {
    setValue(nextStatus);
    startTransition(async () => {
      try {
        await updateBlogStatus(id, nextStatus);
        toast.success("Blog status updated");
        router.refresh();
      } catch (error) {
        setValue(status);
        toast.error(error instanceof Error ? error.message : "Unable to update status");
      }
    });
  }

  return (
    <Select value={value} onValueChange={changeStatus} disabled={pending}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="published">Published</SelectItem>
        <SelectItem value="archived">Archived</SelectItem>
      </SelectContent>
    </Select>
  );
}
