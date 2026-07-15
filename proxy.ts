import { auth } from "@/auth";
import {
  canAccessAdminPath,
  getAdminAccessForEmail,
  getAdminHomePath,
} from "@/lib/adminAccess";
import { NextResponse } from "next/server";

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminPage = pathname.startsWith("/admin");

  if (!isAdminApi && !isAdminPage) {
    return NextResponse.next();
  }

  const access = getAdminAccessForEmail(request.auth?.user?.email);

  if (!access) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL(getAdminHomePath(access), request.url));
  }

  if (pathname === "/admin" && access === "blog") {
    return NextResponse.redirect(new URL(getAdminHomePath(access), request.url));
  }

  if (!canAccessAdminPath(pathname, access)) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.redirect(new URL(getAdminHomePath(access), request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
