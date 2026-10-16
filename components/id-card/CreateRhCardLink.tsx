"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CARD_PATH = "/dashboard/id-card";
const SIGN_IN_PATH = `/sign-in?callbackUrl=${encodeURIComponent(CARD_PATH)}`;

export function CreateRhCardLink() {
  const [href, setHref] = useState(SIGN_IN_PATH);

  useEffect(() => {
    const controller = new AbortController();
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const session = await response.json();
        if (!controller.signal.aborted && session?.user) setHref(CARD_PATH);
      } catch {
        // Visitors can sign in and return directly to card creation.
      }
    }
    void loadSession();
    return () => controller.abort();
  }, []);

  return (
    <Button asChild className="h-11 w-full px-5">
      <Link href={href} prefetch={false}>
        Create Your RH Membership Card
        <ArrowRight aria-hidden="true" className="ml-2 size-4" />
      </Link>
    </Button>
  );
}
