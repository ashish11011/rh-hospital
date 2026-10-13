import type { ComponentProps } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const AUTH_LINK_CLASS_NAME =
  "text-primary font-semibold underline-offset-4 hover:underline focus-visible:underline";

export function AuthLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link {...props} className={cn(AUTH_LINK_CLASS_NAME, className)} />;
}
