"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { requestAccountDeletionOrDeactivation } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AccountDeletionSection() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitRequest = async () => {
    setIsSubmitting(true);

    try {
      const res = await requestAccountDeletionOrDeactivation();

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success(
        "Account deletion or deactivation request raised successfully.",
      );
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to raise account deletion or deactivation request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-red-100 bg-red-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-red-950">
              Delete or deactivate account
            </h2>
            <p className="mt-1 text-sm leading-6 text-red-800">
              Raise a request for the admin team to review. Your account will
              not be deleted automatically.
            </p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="shrink-0 gap-2">
              <Trash2 className="h-4 w-4" />
              Raise Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Raise account request?</DialogTitle>
              <DialogDescription>
                The admin will receive your account details by email, and you
                will receive a confirmation email after the request is raised.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={submitRequest}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Confirm Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
