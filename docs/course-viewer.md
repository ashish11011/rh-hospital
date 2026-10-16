# Dashboard course viewing

The dashboard's My Courses cards open `/dashboard/courses/[courseId]`. Only active user accounts with an `enrolled` course enrollment can open the viewer or request its media. Pending, expired and refunded enrollments do not grant playback. Course items are ordered by priority, creation time and ID. The `.m3u8` file extension takes precedence over legacy `mp4` media types. PDF and presentation resources open through the same authenticated route.

`/api/course/media/[itemId]` fetches media through the existing project CLOUDFRONT_URL configuration (NEXT_PUBLIC_CLOUDFRONT_URL or the project default). It does not require S3 credentials. Each request rechecks enrollment, uses private/no-store responses, and never redirects to a public media URL. HLS playlist URLs (including nested variants, keys and initialization maps) are rewritten to the authenticated route. Byte ranges are forwarded to CloudFront for MP4 and HLS byte-range playback. HLS assets must reside under the directory containing the lesson's top-level playlist; external CDN references or references outside that directory fail closed. Values in media_url must be course/... storage keys, as in the existing course records. Legacy database paths use form encoding: plus characters are decoded as spaces, and percent escapes are decoded once (%2B represents a literal plus). References inside HLS playlists use URL path semantics, so literal plus characters there are preserved.

The five requested Video.js package versions are pinned. Video controls include playback speed, fullscreen, 10-second forward/backward buttons and mobile double-tap seeking. The saved email address is rendered inside the player and moves every eight seconds. Element fullscreen preserves it; native-video fullscreen is avoided using Video.js full-window fallback. Picture-in-picture and remote playback controls are disabled because those surfaces cannot carry the HTML watermark.

## Protection limits and infrastructure

The HTML watermark is a deterrent and can be removed by a technically capable viewer. It does not prevent OS-level screen recording or an external camera. Installing and initializing videojs-contrib-eme does not encrypt existing HLS media. Actual DRM requires DRM-packaged streams, a license service, and authenticated key-system configuration. No DRM license service is configured by this change.

The proxy protects this app's media requests, not preexisting public storage/CDN URLs. Restrict the course prefix at the bucket and CDN before claiming private delivery; account for existing mobile clients that may use those URLs. This change does not modify cloud infrastructure. Proxying segments also adds app bandwidth and per-segment database checks; at scale use an authenticated CDN delivery design.

Sprite-thumbnails is loaded and the player accepts an optional `sprite` configuration (`url`, `width`, `height`, `columns`, `interval`). Current course records have no sprite URL or dimensions, so previews are not enabled and no nonexistent asset is requested. Generate sprite sheets and provide their metadata to enable previews.

## Verification

Run `node --test tests/course-media.test.cjs` and `npx tsc --noEmit --incremental false`.

With a purchased test account, check My Courses, multiple lessons, seek and playback speed, mobile inline/full-window playback, the watermark after eight seconds, and resources. Check a nested HLS variant and byte-range media against actual stored files. Repeat media requests after logout and after changing enrollment to expired/refunded; access must be denied. Live playback requires working database credentials and accessible CloudFront media and a purchased account.
