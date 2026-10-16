import { COURSE_CLOUDFRONT_URL } from "./cloudfront";
import { courseMediaKey } from "./courseMedia";

export type CoursePlaybackGrant = {
  mediaUrl: string;
  mediaType: string;
  expiresAt: number;
};

/** Database keys use legacy form encoding; URL paths use URI encoding. */
function courseFileLocation(value: string) {
  const trimmed = value.trim();
  const absolute = /^https?:\/\//i.test(trimmed);
  // Inspect the original path: URL parsing otherwise erases dot segments first.
  const rawPath = absolute
    ? trimmed.match(/^https?:\/\/[^/?#]+(\/[^?#]*)?/i)?.[1]
    : null;
  if (absolute && !rawPath)
    throw new Error("Unsupported course media location");
  const key = absolute
    ? decodeURIComponent(rawPath!.replace(/^\/+/, ""))
    : courseMediaKey(trimmed);
  const parts = key.split("/");
  if (
    parts[0] !== "course" ||
    parts.some((part) => !part || part === "." || part === "..") ||
    /[\\\x00-\x1f\x7f]/.test(key)
  ) {
    throw new Error("Unsupported course media location");
  }
  // Reject encoded traversal that an intermediary might decode a second time.
  if (/%(?:2e|2f|5c)/i.test(key))
    throw new Error("Unsupported course media location");
  // encodeURIComponent leaves '*'; policy wildcards must never come from a filename.
  const pathname = `/${parts.map((part) => encodeURIComponent(part).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)).join("/")}`;
  const origin = new URL(COURSE_CLOUDFRONT_URL);
  if (
    origin.protocol !== "https:" ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  ) {
    throw new Error("Invalid course CDN configuration");
  }
  return { key, parts, pathname, origin };
}

export function courseDocumentLocation(value: string) {
  const { pathname, origin } = courseFileLocation(value);
  return `${origin.origin}${pathname}`;
}

export function coursePlaybackLocation(value: string) {
  const { key, parts, pathname, origin } = courseFileLocation(value);
  const hls = /\.m3u8$/i.test(key);
  const mp4 = /\.mp4$/i.test(key);
  if (!hls && !mp4)
    throw new Error("Only HLS and MP4 course playback is supported");
  const directory = pathname.slice(0, pathname.lastIndexOf("/") + 1);
  if (hls && parts.length < 3)
    throw new Error("A dedicated lesson directory is required");
  return {
    mediaUrl: `${origin.origin}${pathname}`,
    mediaType: hls ? "application/x-mpegURL" : "video/mp4",
    resource: `${origin.origin}${hls ? `${directory}*` : pathname}`,
    cookiePath: hls ? directory : pathname,
  };
}
