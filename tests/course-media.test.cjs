const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
function load(file, modules = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, { exports, URL, Response, Headers, console, ...globals, require: name => modules[name] });
  return exports;
}
const media = load('lib/courseMedia.ts');
const cloudfront = load('lib/cloudfront.ts', {}, { process: { env: { NEXT_PUBLIC_CLOUDFRONT_URL: 'https://cdn.example', NEXT_PUBLIC_COURSE_CLOUDFRONT_URL: 'https://cdn.example' } } });
const publicAssets = load('lib/publicAsset.ts', { './cloudfront': cloudfront, './courseMedia': media });
test('decodes legacy database paths exactly once, including spaces, ampersands and literal plus', () => {
  assert.equal(media.courseMediaKey('course/transcoded/nrp/videos/nrp-1-topic+1-001/index.m3u8'), 'course/transcoded/nrp/videos/nrp-1-topic 1-001/index.m3u8');
  assert.equal(media.courseMediaKey('course/transcoded/nrp/videos/nrp-1-Trauma+Triage-001/index.m3u8'), 'course/transcoded/nrp/videos/nrp-1-Trauma Triage-001/index.m3u8');
  assert.equal(media.courseMediaKey('course/Airway+%26+breathing/index.m3u8'), 'course/Airway & breathing/index.m3u8');
  assert.equal(media.courseMediaKey('course/A%2BB%2520/index.m3u8'), 'course/A+B%20/index.m3u8');
});
const root = 'course/transcoded/nrp/Airway+&+breathing/index.m3u8';
test('nested playlists, encoded names, and literal plus signs resolve correctly', () => {
  assert.equal(media.resolveLessonAsset(root, root, '720p/index.m3u8'), root.replace('index.m3u8', '720p/index.m3u8'));
  assert.equal(media.resolveLessonAsset(root, root.replace('index.m3u8', '720p/index.m3u8'), '../key.bin'), root.replace('index.m3u8', 'key.bin'));
  assert.equal(media.resolveLessonAsset(root, root, 'segment+%26+1.ts'), root.replace('index.m3u8', 'segment+&+1.ts'));
});
test('rejects directory traversal, external hosts and encoded traversal', () => {
  for (const uri of ['../other/index.m3u8', 'https://evil.example/video.ts', '//evil.example/a.ts', '%2e%2e/out.ts', '%2e%2e%2fout.ts', '..\\out.ts']) {
    assert.throws(() => media.resolveLessonAsset(root, root, uri));
  }
});
test('rewrites variant playlists, segments, encryption keys and initialization maps', () => {
  const input = '#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI="key.bin"\n#EXT-X-MAP:URI="init.mp4"\n720p/index.m3u8\nsegment.ts\n';
  const output = media.rewritePlaylist(input, uri => `/protected/${uri}`);
  assert.match(output, /URI="\/protected\/key.bin"/);
  assert.match(output, /URI="\/protected\/init.mp4"/);
  assert.match(output, /\n\/protected\/720p\/index.m3u8\n/);
  assert.match(output, /\n\/protected\/segment.ts\n/);
});
function route(access, upstream = async () => { throw new Error("Unexpected CDN call"); }, item = {}) {
  let calls = 0;
  const itemId = '10000000-0000-4000-8000-000000000001';
  const query = { from: () => query, where: () => query, limit: async () => [{ courseId: itemId, mediaUrl: 'course/transcoded/nrp/videos/nrp-1-Trauma+Triage-001/index.m3u8', ...item }] };
  const handlers = load('app/api/course/media/[itemId]/route.ts', {
    '@/lib/cloudfront': { CLOUDFRONT_URL: 'https://cdn.example' },
    '@/lib/publicAsset': publicAssets,
    '@/db': { courseItem: { id: 'id' } }, '@/lib/dbConfig': { db: { select: () => query } },
    '@/lib/courseAccess': { getCourseAccess: async () => access, isCourseId: value => value === itemId },
    '@/lib/courseMedia': media, 'drizzle-orm': { eq: () => true }
  }, { fetch: async (...args) => { calls++; return upstream(...args); } });
  return { get: asset => handlers.GET(new Request(`https://app.test/api/course/media/${itemId}${asset || ''}`), { params: Promise.resolve({ itemId }) }), calls: () => calls };
}
test('no enrollment denies media before reading storage', async () => {
  const harness = route(null);
  const response = await harness.get();
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(harness.calls(), 0);
});
test('enrolled users still cannot request another lesson directory', async () => {
  const harness = route({ email: 'learner@example.com' });
  assert.equal((await harness.get('?asset=..%2Fother%2Fsecret.ts')).status, 410);
  assert.equal(harness.calls(), 0);
});

test('the retired video proxy never fetches unsigned course videos', async () => {
  const harness = route({ email: 'learner@example.com' });
  assert.equal((await harness.get()).status, 410);
  assert.equal(harness.calls(), 0);
});

test('course documents read from public while retaining enrollment checks', async () => {
  const harness = route({}, async (url) => {
    assert.equal(url, 'https://cdn.example/public/course/resources/notes.pdf');
    return new Response('pdf');
  }, { mediaType: 'pdf', mediaUrl: 'course/resources/notes.pdf' });
  assert.equal((await harness.get()).status, 200);
});
