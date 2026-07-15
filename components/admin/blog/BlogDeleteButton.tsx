"use client";

import { deleteBlog } from "@/actions/blogAdminActions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export function BlogDeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!window.confirm("Delete this blog? This action cannot be undone.")) return;

    startTransition(async () => {
      try {
        await deleteBlog(id);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to delete blog");
      }
    });
  }

  return (
    <Button variant="destructive" size="sm" onClick={remove} disabled={pending}>
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
  );
}
