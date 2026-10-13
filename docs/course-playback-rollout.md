# Course playback rollout

The code uses signed cookies for videos and exact-file signed URLs for private
course documents. Website document requests stream through the authenticated
media route; mobile requests obtain a five-minute signed URL after enrollment
verification. All paid course content stays under `course/*`, without a `public/`
rewrite. AWS/DNS changes,
production deployment, and real browser/device playback have not been performed.
The AWS account-read approval was declined during implementation.

## Environment

Set these on the **website backend** before deploying:

```dotenv
CLOUDFRONT_PRIVATE_ACCESS=<existing private PEM, server only>
CLOUDFRONT_PUBLIC_KEY_ID=<CloudFront public key ID matching that PEM>
NEXT_PUBLIC_CLOUDFRONT_URL=https://media.rhhealthcaresimulation.com
NEXT_PUBLIC_COURSE_CLOUDFRONT_URL=https://media.rhhealthcaresimulation.com
```

The local private key is configured and is RSA. The public key ID is not configured
locally. Use the public **key ID**, not the key-group or distribution ID.
Actual PEM line breaks and escaped `\n` line breaks are both supported.
Never put the private key in `NEXT_PUBLIC_*`, `EXPO_PUBLIC_*`, source control,
client storage, or logs.

Mobile builds default to this hostname. If overriding them, set:

```dotenv
EXPO_PUBLIC_CLOUDFRONT_URL=https://media.rhhealthcaresimulation.com
EXPO_PUBLIC_COURSE_CLOUDFRONT_URL=https://media.rhhealthcaresimulation.com
```

Browser cookie grants require an HTTPS website under
`rhhealthcaresimulation.com`. Localhost and unrelated Vercel preview domains
deliberately return 503 for website grants because browsers would reject the
production-domain cookies. Use a preview hostname under the production domain
for browser integration testing, and explicitly allow that origin in CDN CORS.

## Distribution and DNS

1. Find the distribution whose domain is `d2c3lsl35lix55.cloudfront.net`.
2. Add `media.rhhealthcaresimulation.com` as an alternate domain. Attach an ACM
   certificate in **us-east-1** covering this hostname and all existing aliases.
   Preserve the distribution's other configuration and origins.
3. Point the DNS CNAME `media` to `d2c3lsl35lix55.cloudfront.net`, or use the
   equivalent Route 53 alias. Wait for DNS, certificate validation and distribution
   deployment to complete.
4. Ensure the existing trusted key group contains the public key corresponding
   to `CLOUDFRONT_PRIVATE_ACCESS`. Attach it to the `course/*` behavior with
   **Restrict viewer access = Yes**. This covers playlists, segments, MP4,
   initialization files and encryption keys. Keep `public/*` unrestricted.
5. Permit HTTPS GET/HEAD/OPTIONS for `course/*`; redirect HTTP to HTTPS. Set a
   response headers policy with credentialed CORS:
   - Allowed origins: `https://www.rhhealthcaresimulation.com` and
     `https://rhhealthcaresimulation.com` (plus any explicit same-site preview).
   - Allow credentials: true. Do not use `Access-Control-Allow-Origin: *`.
   - Allowed methods: GET, HEAD, OPTIONS.
   - Allowed request headers: Range, Content-Type.
   - Exposed headers: Accept-Ranges, Content-Range, Content-Length, Content-Type.
   - Origin override: true, to replace incompatible S3 CORS headers.
6. Exclude cookies from the cache key and S3 origin request policy. CloudFront
   validates viewer signatures even on cache hits. Configure any CORS cache/origin
   settings consistently with the response policy; avoid sharing origin-dependent
   responses without varying on Origin. Do not forward website authentication
   cookies to S3.

See [CloudFront alternate hostnames](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html)
and [trusted signers](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-trusted-signers.html).

## Origin and manifest audit

- Use CloudFront OAC with signed origin requests for the S3 REST origin. Allow
  `s3:GetObject` for `course/*` to the CloudFront service principal, conditioned on
  this distribution's ARN. Remove anonymous course access from bucket policy and
  object ACLs. Preserve unrelated required IAM access and private invoice objects.
- Keep anonymous public-media access confined to `public/*`. Inspect the other
  distribution previously referenced by mobile,
  `d12z58c4k5tsm1.cloudfront.net`, and any other origin/CDN routes: they must not
  provide unsigned access to the same course files. OAC by itself does not require
  signed cookies at the viewer edge.
- Check the master and every variant playlist stored under each lesson folder.
  References must be relative to that folder or use
  `https://media.rhhealthcaresimulation.com` inside the same folder. Replace old
  absolute CloudFront/S3 references in playlists if found, including URI attributes
  for encryption keys and initialization maps. Do not rename or move folders.
- A signed HLS policy grants the playlist's parent directory recursively. That
  directory must contain only this lesson's files, or files belonging to the same
  course. Verify no other course uses a key under that directory. The signer
  rejects `/course/index.m3u8` rather than granting the entire `/course/*` tree.
- MP4 policies authorize exactly one encoded object path. Paid course documents
  also stay under `course/*`; their grants authorize one encoded file for five
  minutes. Website responses stream the file without exposing the signed CDN URL.

See [protecting S3 origins](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html).

## API and playback behavior

Both POST routes accept `{ "courseItemId": "<lesson UUID>" }`:

- Website: `/api/course/<course UUID>/access`, authenticated by the existing
  website session. Returns `{ mediaUrl, mediaType, expiresAt }` and three Secure,
  HttpOnly, SameSite=Lax cookies on the production parent domain with the selected
  lesson path. Full admins can preview saved lessons without enrollment.
- Native: `/api/auth/mobile/courses/<course UUID>/access`, authenticated by a valid
  Cognito bearer token. Returns the same fields plus `cookies`; it never falls back
  to a website session. The native player passes these in its Cookie header.

Grants last 3,600 seconds; renewals occur five minutes before expiry and on return
to the foreground. Every grant rechecks the latest enrollment and active user/course.
Pending, refunded and expired enrollments receive no grant. Historical enrolled
rows cannot override a newer refund. Client-supplied storage paths are never used.
Network/server errors retry after 30 seconds while existing access remains valid;
expiry stops playback even when a request hangs. Denial clears the source and stops
automatic retries. The user can retry manually after access is restored.

Enrollment is queried once per grant, not per media request. Progress saving still
uses the existing application endpoints. Media requests go directly to CloudFront.
The old `/api/course/media/<lesson UUID>` video proxy now returns 410; its document
branch remains available. Existing grants remain usable until expiry after refund
or account deactivation. Signatures are bearer credentials and are not DRM.

## Release acceptance

1. Verify hostname/TLS, trusted key matching, CORS, origin isolation and relative
   manifests before production clients switch. Set the backend public key ID.
2. Deploy the updated website and release updated Android/iOS apps. Coordinate
   viewer-access enforcement with the release. Older installed mobile versions
   do not request grants and will fail once unsigned playback is disabled; use the
   app's existing mandatory-update mechanism as needed. Deployment is not part of
   the local code changes.
3. On Chrome and Safari, inspect requests while playing and seeking. Playlists,
   nested playlists, chunks, keys and initialization files must use the media
   hostname with cookies and must not call the old video proxy. Confirm 206 range
   behavior for MP4.
4. Repeat HLS/MP4 playback on real iOS and Android devices. Confirm native Cookie
   headers reach all HLS resources, including keys and variant playlists. Test
   pause/resume, app background/foreground and long playback beyond renewal.
5. Remove or tamper with signed cookies, or use an expired policy: CloudFront must
   reject every private media URL. A lesson grant must not authorize sibling
   folders, other courses, direct S3 or an alternative unsigned CDN.
6. Refund/expire an enrollment and verify the next grant is denied. Test transient
   renewal failures followed by recovery, and unrecovered expiry stopping playback.
7. Confirm `/public/*` images, banners, membership photos and documents still load.
   Confirm watermark, saved progress and full-admin previews.

Automated focused checks:

```sh
cd rh-hospital
node --test tests/course-playback-access.test.cjs tests/course-grant-lifecycle.test.cjs tests/mobile-course-source.test.cjs tests/course-media.test.cjs tests/public-assets.test.cjs tests/course-progress.test.cjs
npx tsc --noEmit --incremental false
```

```sh
cd my-app
npx tsc --noEmit --incremental false
```

The cryptographic, endpoint, path, renewal and proxy checks are local/mocked
validation. They do not establish deployed AWS enforcement or native HLS cookie
propagation; the release acceptance checks above remain required.

Implementation verification: 37 focused checks and TypeScript in both apps pass.
The website production build passes with network access (needed by next/font).
ESLint could not run because the local `doctrine` dependency is missing `./typed`.
