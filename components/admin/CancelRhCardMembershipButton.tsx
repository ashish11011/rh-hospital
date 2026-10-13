"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cancelRhCardMembership } from "@/actions/rhCardAdminActions";
import { Button } from "@/components/ui/button";

export function CancelRhCardMembershipButton({
  cardId,
  memberName,
  isActive,
}: {
  cardId: string;
  memberName: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cancelled, setCancelled] = useState(false);
  const inactive = !isActive || cancelled;

  function cancel() {
    if (pending || inactive) return;
    if (
      !window.confirm(
        `Cancel RH Membership Card for ${memberName}? This will deactivate the card and remove course discount eligibility.`,
      )
    )
      return;

    startTransition(async () => {
      try {
        const result = await cancelRhCardMembership(cardId);
        if (!result.success) {
          toast.error(result.error || "Unable to cancel membership.");
          return;
        }
        setCancelled(true);
        toast.success("RH Membership Card cancelled.");
        router.refresh();
      } catch {
        toast.error("Unable to cancel membership. Please try again.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending || inactive}
      onClick={cancel}
      aria-label={
        inactive
          ? `RH membership inactive for ${memberName}`
          : `Cancel RH membership for ${memberName}`
      }
    >
      {pending ? (
        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <Ban aria-hidden="true" className="size-4" />
      )}
      {pending
        ? "Cancelling…"
        : inactive
          ? "Membership inactive"
          : "Cancel membership"}
    </Button>
  );
}
