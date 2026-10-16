const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const exportsForSource = {};
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname,'../../my-app/lib/coursePlayback.ts'),'utf8'), {
  compilerOptions:{ module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2022 }
}).outputText;
vm.runInNewContext(code, { exports:exportsForSource, URL, Date, Error,
  require:name => {
    assert.equal(name,'./cloudfront'); return {COURSE_CLOUDFRONT_URL:'https://media.rhhealthcaresimulation.com'};
  } });
const grant = (overrides = {}) => ({
  mediaUrl:'https://media.rhhealthcaresimulation.com/course/lesson/index.m3u8', mediaType:'application/x-mpegURL',
  expiresAt:Math.floor(Date.now()/1000)+3600,
  cookies:{'CloudFront-Policy':'policy_','CloudFront-Signature':'signature-~_','CloudFront-Key-Pair-Id':'KEY123'}, ...overrides,
});
test('native HLS source passes only signed CloudFront cookies and disables persistent caching', () => {
  const source=exportsForSource.courseVideoSource(grant());
  assert.equal(source.contentType,'hls');
  assert.equal(source.uri,grant().mediaUrl);
  assert.equal(source.headers.Cookie,'CloudFront-Policy=policy_; CloudFront-Signature=signature-~_; CloudFront-Key-Pair-Id=KEY123');
  assert.equal(source.headers.Authorization,undefined);
  assert.equal(source.useCaching,false);
});
test('MP4 sources use progressive playback with the same cookie authentication', () => {
  assert.equal(exportsForSource.courseVideoSource(grant({mediaType:'video/mp4',mediaUrl:'https://media.rhhealthcaresimulation.com/course/lesson/video.mp4'})).contentType,'progressive');
});
test('native player refuses expired grants, cookie injection and forwarding credentials to other origins', () => {
  for (const changes of [{expiresAt:0},{cookies:{}},{cookies:{...grant().cookies,'CloudFront-Policy':'policy\r\nAuthorization: secret'}},
    {mediaUrl:'https://evil.example/course/video.mp4'}, {mediaUrl:'http://media.rhhealthcaresimulation.com/course/video.mp4'},
    {mediaUrl:'https://media.rhhealthcaresimulation.com/public/video.mp4'}, {mediaType:'application/pdf'}]) {
    assert.throws(() => exportsForSource.courseVideoSource(grant(changes)));
  }
});
