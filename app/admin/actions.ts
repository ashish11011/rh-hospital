"use server";
import { runLoggedOperation } from "@/lib/logging/operations";

import { signOut } from "@/auth";

export async function adminLogoutAction() {
  return runLoggedOperation(
    "service",
    "app/admin/actions.ts:adminLogoutAction",
    async () => {
      await signOut({ redirectTo: "/sign-in" });
    },
  );
}
