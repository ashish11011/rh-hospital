export type AdminAccess = "full" | "content";
export type AdminPermission = "full" | "blog" | "workshop" | "contacts";

export const FULL_ADMIN_EMAILS = [
  "rhhealthcare1@gmail.com",
  "bishnoi11011@gmail.com",
] as const;

export const CONTENT_ADMIN_EMAILS = [
  "rhhealthcaresimulationcenter@gmail.com",
] as const;

export function normalizeAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() || "";
}

export function getAdminAccessForEmail(
  email?: string | null,
): AdminAccess | null {
  const normalizedEmail = normalizeAdminEmail(email);

  if ((FULL_ADMIN_EMAILS as readonly string[]).includes(normalizedEmail))
    return "full";
  if ((CONTENT_ADMIN_EMAILS as readonly string[]).includes(normalizedEmail))
    return "content";

  return null;
}

export function getAdminHomePath(access: AdminAccess) {
  return access === "content" ? "/admin/blog" : "/admin";
}

export function hasAdminPermission(
  access: AdminAccess | null,
  permission: AdminPermission,
) {
  if (access === "full") return true;

  return (
    access === "content" &&
    (permission === "blog" ||
      permission === "workshop" ||
      permission === "contacts")
  );
}

export function canAccessAdminPath(pathname: string, access: AdminAccess) {
  if (access === "full") return true;

  const routes: [string, AdminPermission][] = [
    ["/admin/blog", "blog"],
    ["/api/admin/blog", "blog"],
    ["/admin/workshop", "workshop"],
    ["/api/admin/workshop", "workshop"],
    ["/admin/contact-enquiries", "contacts"],
    ["/api/admin/contact-enquiries", "contacts"],
  ];

  return routes.some(
    ([path, permission]) =>
      (pathname === path || pathname.startsWith(`${path}/`)) &&
      hasAdminPermission(access, permission),
  );
}
