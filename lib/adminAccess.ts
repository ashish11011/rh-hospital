export type AdminAccess = "full" | "blog";

export const FULL_ADMIN_EMAILS = [
  "rhhealthcare1@gmail.com",
  "bishnoi11011@gmail.com",
] as const;

export const BLOG_ADMIN_EMAILS = [
  "rhhealthcaresimulationcenter@gmail.com",
] as const;

export function normalizeAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() || "";
}

export function getAdminAccessForEmail(email?: string | null): AdminAccess | null {
  const normalizedEmail = normalizeAdminEmail(email);

  if ((FULL_ADMIN_EMAILS as readonly string[]).includes(normalizedEmail)) return "full";
  if ((BLOG_ADMIN_EMAILS as readonly string[]).includes(normalizedEmail)) return "blog";

  return null;
}

export function getAdminHomePath(access: AdminAccess) {
  return access === "blog" ? "/admin/blog" : "/admin";
}

export function canAccessAdminPath(pathname: string, access: AdminAccess) {
  if (access === "full") return true;

  return (
    pathname === "/admin/blog" ||
    pathname.startsWith("/admin/blog/") ||
    pathname === "/api/admin/blog" ||
    pathname.startsWith("/api/admin/blog/")
  );
}
