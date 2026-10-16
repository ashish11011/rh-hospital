import "server-only";
import { getSignedCookies, getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { createPrivateKey } from "node:crypto";
import { course, courseEnrolment, courseItem, user } from "@/db";
import { db } from "@/lib/dbConfig";
import { and, desc, eq } from "drizzle-orm";
import {
  courseDocumentLocation,
  coursePlaybackLocation,
} from "@/lib/coursePlayback";
import { isCourseVideoMedia } from "@/lib/publicAsset";
import { isCourseId } from "@/lib/courseAccess";
import { getAdminAccessForEmail } from "@/lib/adminAccess";

export class CoursePlaybackError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const COURSE_COOKIE_DOMAIN = "rhhealthcaresimulation.com";
export const COURSE_GRANT_SECONDS = 18000;

async function getAuthorizedCourseMedia(
  courseId: string,
  itemId: string,
  email: string,
  allowAdmin = false,
) {
  if (!isCourseId(courseId) || !isCourseId(itemId))
    throw new CoursePlaybackError(400, "Invalid course or lesson ID");
  const admin = allowAdmin && getAdminAccessForEmail(email) === "full";
  let mediaUrl: string;
  if (admin) {
    const [item] = await db
      .select({ mediaUrl: courseItem.mediaUrl })
      .from(courseItem)
      .innerJoin(course, eq(course.id, courseItem.courseId))
      .where(and(eq(courseItem.id, itemId), eq(course.id, courseId)))
      .limit(1);
    if (!item) throw new CoursePlaybackError(404, "Lesson not found");
    mediaUrl = item.mediaUrl;
  } else {
    // Do not filter to enrolled before ordering: an older enrolled row must not
    // override a newer refund or expiry. This is one query per grant, not per chunk.
    const [item] = await db
      .select({
        mediaUrl: courseItem.mediaUrl,
        status: courseEnrolment.enrolmentStatus,
      })
      .from(courseItem)
      .innerJoin(course, eq(course.id, courseItem.courseId))
      .innerJoin(
        user,
        and(eq(user.email, email.toLowerCase()), eq(user.isActive, true)),
      )
      .leftJoin(
        courseEnrolment,
        and(
          eq(courseEnrolment.courseId, course.id),
          eq(courseEnrolment.userId, user.id),
        ),
      )
      .where(
        and(
          eq(courseItem.id, itemId),
          eq(course.id, courseId),
          eq(course.isActive, true),
        ),
      )
      .orderBy(desc(courseEnrolment.createdAt), desc(courseEnrolment.id))
      .limit(1);
    if (!item || item.status !== "enrolled")
      throw new CoursePlaybackError(403, "Course access required");
    mediaUrl = item.mediaUrl;
  }
  return mediaUrl;
}

function courseSigningCredentials() {
  const keyPairId = process.env.CLOUDFRONT_PUBLIC_KEY_ID?.trim();
  const privateKey = process.env.CLOUDFRONT_PRIVATE_ACCESS?.replace(
    /\\r\\n/g,
    "\n",
  )
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();
  if (!keyPairId || !privateKey)
    throw new CoursePlaybackError(503, "Course playback is not configured");
  try {
    createPrivateKey(privateKey);
  } catch {
    throw new CoursePlaybackError(503, "Course playback is not configured");
  }
  return { keyPairId, privateKey };
}

export async function grantCourseDocument(
  courseId: string,
  itemId: string,
  email: string,
  allowAdmin = false,
) {
  const storedUrl = await getAuthorizedCourseMedia(
    courseId,
    itemId,
    email,
    allowAdmin,
  );
  if (isCourseVideoMedia(storedUrl))
    throw new CoursePlaybackError(
      410,
      "Video playback requires a course access grant",
    );
  let url: string;
  try {
    url = courseDocumentLocation(storedUrl);
  } catch {
    throw new CoursePlaybackError(400, "Unsupported course media location");
  }
  const credentials = courseSigningCredentials();
  const expiresAt = Math.floor(Date.now() / 1000) + 300;
  try {
    return {
      mediaUrl: getSignedUrl({
        url,
        ...credentials,
        dateLessThan: new Date(expiresAt * 1000).toISOString(),
      }),
      expiresAt,
    };
  } catch {
    throw new CoursePlaybackError(503, "Course playback is not configured");
  }
}

export async function grantCoursePlayback(
  courseId: string,
  itemId: string,
  email: string,
  allowAdmin = false,
) {
  const mediaUrl = await getAuthorizedCourseMedia(
    courseId,
    itemId,
    email,
    allowAdmin,
  );
  let location: ReturnType<typeof coursePlaybackLocation>;
  try {
    location = coursePlaybackLocation(mediaUrl);
  } catch {
    throw new CoursePlaybackError(400, "Unsupported course media location");
  }
  const { keyPairId, privateKey } = courseSigningCredentials();
  try {
    const expiresAt = Math.floor(Date.now() / 1000) + COURSE_GRANT_SECONDS;
    const cookies = getSignedCookies({
      keyPairId,
      privateKey,
      policy: JSON.stringify({
        Statement: [
          {
            Resource: location.resource,
            Condition: { DateLessThan: { "AWS:EpochTime": expiresAt } },
          },
        ],
      }),
    });
    return {
      mediaUrl: location.mediaUrl,
      mediaType: location.mediaType,
      expiresAt,
      cookies,
      cookiePath: location.cookiePath,
    };
  } catch {
    throw new CoursePlaybackError(503, "Course playback is not configured");
  }
}
