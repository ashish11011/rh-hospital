import { courseItem } from "@/db";
import { db } from "@/lib/dbConfig";
import { CLOUDFRONT_URL } from "@/lib/cloudfront";
import { getCourseAccess, isCourseId } from "@/lib/courseAccess";
import { eq } from "drizzle-orm";
import { isCourseVideoMedia, publicAssetKey } from "@/lib/publicAsset";

export const runtime = "nodejs";
const noStore = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

export async function GET(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  if (!isCourseId(itemId)) return new Response("Not found", { status: 404, headers: noStore });
  if (new URL(request.url).searchParams.has("asset")) return new Response("Video playback requires a course access grant", { status: 410, headers: noStore });
  try {
    const [item] = await db.select().from(courseItem).where(eq(courseItem.id, itemId)).limit(1);
    if (!item || !await getCourseAccess(item.courseId)) return new Response("Course access required", { status: 403, headers: noStore });
    // Documents keep their existing behavior; video bytes are only served by CloudFront.
    if (isCourseVideoMedia(item.mediaUrl, item.mediaType)) return new Response("Video playback requires a course access grant", { status: 410, headers: noStore });
    const key = publicAssetKey(item.mediaUrl);
    if (!key.startsWith('public/')) return new Response("Unsupported media location", { status: 400, headers: noStore });
    const range = request.headers.get('range');
    if (range && !/^bytes=\d*-\d*$/.test(range)) return new Response(null, { status: 416, headers: noStore });
    const url = `${CLOUDFRONT_URL}/${key.split('/').map(encodeURIComponent).join('/')}`;
    const upstream = await fetch(url, {
      cache: 'no-store', redirect: 'error', signal: request.signal,
      headers: range ? { Range: range } : {},
    });
    if (!upstream.ok) {
      await upstream.body?.cancel();
      console.error('Course CDN request failed', { itemId, status: upstream.status });
      const status = upstream.status === 404 ? 404 : upstream.status === 416 ? 416 : 502;
      return new Response(status === 416 ? null : 'Unable to load course media', { status, headers: noStore });
    }
    const headers = new Headers(noStore);
    headers.set('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    headers.set('Accept-Ranges', 'bytes');
    const contentRange = upstream.headers.get('content-range');
    if (contentRange) headers.set('Content-Range', contentRange);
    // fetch may decompress the response, so do not forward its original Content-Length.
    headers.set('Content-Disposition', 'inline');
    return new Response(upstream.body, { status: upstream.status === 206 ? 206 : 200, headers });
  } catch (error) {
    console.error('Course media request failed', { itemId, error: error instanceof Error ? error.name : 'UnknownError' });
    return new Response("Unable to load course media", { status: 502, headers: noStore });
  }
}
