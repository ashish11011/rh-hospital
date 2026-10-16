import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { extractEmailFromToken } from "@/lib/verify-token";
import {
  COURSE_COOKIE_DOMAIN,
  COURSE_GRANT_SECONDS,
  CoursePlaybackError,
  grantCoursePlayback,
} from "@/lib/coursePlaybackAccess";

const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function coursePlaybackResponse(
  request: Request,
  courseId: string,
  mobile = false,
) {
  try {
    let email: string | null | undefined;
    if (mobile) {
      const match = request.headers
        .get("authorization")
        ?.match(/^Bearer\s+(\S+)$/i);
      if (!match) throw new CoursePlaybackError(401, "Authentication required");
      email = await extractEmailFromToken(match[1]);
    } else {
      // Cookie-authenticated grants are only accepted from this website.
      const origin = request.headers.get("origin");
      if (origin && origin !== new URL(request.url).origin)
        throw new CoursePlaybackError(403, "Invalid request origin");
      email = (await auth())?.user?.email;
    }
    if (!email) throw new CoursePlaybackError(401, "Authentication required");
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new CoursePlaybackError(400, "Invalid request body");
    }
    const itemId =
      body && typeof body === "object" && "courseItemId" in body
        ? body.courseItemId
        : null;
    if (typeof itemId !== "string")
      throw new CoursePlaybackError(400, "A courseItemId is required");
    const grant = await grantCoursePlayback(
      courseId,
      itemId,
      email.toLowerCase(),
      !mobile,
    );
    const { mediaUrl, mediaType, expiresAt } = grant;
    const response = NextResponse.json(
      mobile
        ? { mediaUrl, mediaType, expiresAt, cookies: grant.cookies }
        : { mediaUrl, mediaType, expiresAt },
      { headers },
    );
    if (!mobile) {
      // Never claim success for a hostname on which the browser will discard these cookies.
      const host = new URL(request.url).hostname;
      const mediaHost = new URL(mediaUrl).hostname;
      if (
        ![host, mediaHost].every(
          (value) =>
            value === COURSE_COOKIE_DOMAIN ||
            value.endsWith(`.${COURSE_COOKIE_DOMAIN}`),
        )
      ) {
        throw new CoursePlaybackError(
          503,
          "Signed-cookie playback requires the production website and media hostname",
        );
      }
      for (const [name, value] of Object.entries(grant.cookies)) {
        response.cookies.set(name, value, {
          domain: COURSE_COOKIE_DOMAIN,
          path: grant.cookiePath,
          secure: true,
          httpOnly: true,
          sameSite: "lax",
          maxAge: COURSE_GRANT_SECONDS,
        });
      }
    }
    return response;
  } catch (error) {
    if (error instanceof CoursePlaybackError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers },
      );
    console.error("Course playback grant failed", {
      type: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { error: "Unable to grant course playback" },
      { status: 503, headers },
    );
  }
}
