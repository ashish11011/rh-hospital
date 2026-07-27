export const CLOUDFRONT_URL = (
  process.env.NEXT_PUBLIC_CLOUDFRONT_URL ||
  "https://d2c3lsl35lix55.cloudfront.net"
).replace(/\/$/, "");

export function cloudfrontAssetUrl(key?: string | null) {
  if (!key) return "";
  return `${CLOUDFRONT_URL}/${cloudfrontAssetKey(key)}`;
}

export function cloudfrontAssetKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      return decodeURIComponent(new URL(trimmed).pathname.replace(/^\/+/, ""));
    }
  } catch {
    // Keep the submitted value and normalize it as a key below.
  }

  return trimmed.replace(/^\/+/, "");
}
