import {
  CLOUDFRONT_URL,
  COURSE_CLOUDFRONT_URL,
  cloudfrontAssetKey,
} from "./cloudfront";
import { courseMediaKey } from "./courseMedia";

export function publicAssetKey(value: string) {
  const trimmed = value.trim();
  let key = cloudfrontAssetKey(trimmed);
  if (/^https?:\/\//i.test(trimmed)) {
    const host = new URL(trimmed).hostname;
    // Path-style S3 URLs include the bucket name before the actual object key.
    if (/^s3[.-].*amazonaws\.com$/.test(host) || host === "s3.amazonaws.com") {
      key = key.split("/").slice(1).join("/");
    }
  } else {
    try {
      key = decodeURIComponent(key);
    } catch {
      /* Preserve literal percent signs. */
    }
  }
  if (!key) return "";
  if (
    key.includes("\\") ||
    key.split("/").some((part) => part === "." || part === "..")
  ) {
    throw new Error("Invalid public media path");
  }
  return key.startsWith("public/") ? key : `public/${key}`;
}

function isStorageUrl(value: string) {
  try {
    const host = new URL(value).hostname;
    return (
      host === new URL(CLOUDFRONT_URL).hostname ||
      host === "media.rhhealthcaresimulation.com" ||
      host.endsWith(".cloudfront.net") ||
      /(^|\.)s3[.-].*amazonaws\.com$/.test(host) ||
      host === "s3.amazonaws.com"
    );
  } catch {
    return false;
  }
}

export function publicAssetUrl(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) && !isStorageUrl(trimmed)) return trimmed;
  const key = publicAssetKey(trimmed)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${CLOUDFRONT_URL}/${key}`;
}

export function isCourseVideoMedia(value: string, mediaType?: string | null) {
  const type = mediaType?.trim().toLowerCase() || "";
  return (
    /^(video(?:\/.*)?|mp4|hls|application\/(?:x-mpegurl|vnd\.apple\.mpegurl|dash\+xml))$/.test(
      type,
    ) || /\.(?:mp4|m3u8|mpd|webm|mov|m4v)(?:[?#]|$)/i.test(value)
  );
}

export function courseAssetKey(value: string, mediaType?: string | null) {
  return isCourseVideoMedia(value, mediaType)
    ? cloudfrontAssetKey(value)
    : publicAssetKey(value);
}

export function courseAssetUrl(value: string, mediaType?: string | null) {
  if (!isCourseVideoMedia(value, mediaType)) return publicAssetUrl(value);
  const key = /^https?:\/\//i.test(value) ? cloudfrontAssetKey(value) : courseMediaKey(value);
  return `${COURSE_CLOUDFRONT_URL}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function publicMediaHtml(content?: string | null) {
  return (content || "").replace(/https?:\/\/[^\s"'<>)]+/gi, (url) => {
    const key = cloudfrontAssetKey(url);
    const courseVideo =
      /^(?:course|courses)\//.test(key) && isCourseVideoMedia(url);
    if (!isStorageUrl(url) || courseVideo) return url;
    return publicAssetUrl(url);
  });
}

export function isMembershipPhotoKey(
  key: string | null | undefined,
  userId: string,
) {
  if (!key) return false;
  const expected = `public/membership-cards/${userId}/`;
  try {
    // Accept old saved drafts while checking ownership against the new prefix.
    return publicAssetKey(key).startsWith(expected);
  } catch {
    return false;
  }
}
