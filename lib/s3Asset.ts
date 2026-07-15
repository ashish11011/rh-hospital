const DEFAULT_CLOUDFRONT_URL = "https://d2c3lsl35lix55.cloudfront.net";

function getCloudFrontBaseUrl() {
  return (process.env.NEXT_PUBLIC_CLOUDFRONT_URL || DEFAULT_CLOUDFRONT_URL).replace(/\/$/, "");
}

function safelyDecodeUriComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function buildCloudFrontUrl(key: string) {
  const cleanKey = key
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => encodeURIComponent(safelyDecodeUriComponent(part)))
    .join("/");

  return `${getCloudFrontBaseUrl()}/${cleanKey}`;
}

export function getS3AssetUrl(keyOrUrl?: string | null) {
  const value = keyOrUrl?.trim();

  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);

      if (url.hostname.includes(".s3.") || url.hostname === "s3.amazonaws.com") {
        return buildCloudFrontUrl(url.pathname);
      }
    } catch {
      return value;
    }

    return value;
  }

  return buildCloudFrontUrl(value);
}
