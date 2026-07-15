const DEFAULT_CLOUDFRONT_URL = "https://d2c3lsl35lix55.cloudfront.net";

export function getS3AssetUrl(keyOrUrl?: string | null) {
  const value = keyOrUrl?.trim();

  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_CLOUDFRONT_URL || DEFAULT_CLOUDFRONT_URL).replace(/\/$/, "");
  const cleanKey = value
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${baseUrl}/${cleanKey}`;
}
