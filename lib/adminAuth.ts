import { runLoggedOperation } from "@/lib/logging/operations";
import { auth } from "@/auth";
import {
  AdminPermission,
  getAdminAccessForEmail,
  getAdminHomePath,
  hasAdminPermission,
} from "@/lib/adminAccess";
import { redirect } from "next/navigation";

export async function getCurrentAdminAccess() {
  return runLoggedOperation(
    "service",
    "lib/adminAuth.ts:getCurrentAdminAccess",
    async () => {
      const session = await auth();
      const access = getAdminAccessForEmail(session?.user?.email);

      return {
        access,
        email: session?.user?.email || null,
      };
    },
  );
}

export async function requireAdmin(requiredAccess: AdminPermission = "full") {
  return runLoggedOperation(
    "service",
    "lib/adminAuth.ts:requireAdmin",
    async () => {
      const session = await auth();
      const access = getAdminAccessForEmail(session?.user?.email);

      if (!session?.user?.email || !access) {
        redirect("/sign-in?callbackUrl=/admin");
      }

      if (!hasAdminPermission(access, requiredAccess)) {
        redirect(getAdminHomePath(access));
      }

      return {
        access,
        email: session.user.email,
      };
    },
  );
}
