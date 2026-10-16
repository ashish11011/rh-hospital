import { publicAssetUrl } from "./publicAsset";

export function getS3AssetUrl(keyOrUrl?: string | null) {
  return publicAssetUrl(keyOrUrl);
}
