const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const tick = () => new Promise(resolve => setImmediate(resolve));
function load(fetch) {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '../lib/coursePlaybackProgress.ts'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports, fetch });
  return exports.createProgressSaver;
}
test('saves integer seconds to the mobile endpoint with session cookies and keepalive', async () => {
  const calls = [];
  const save = load(async (...args) => { calls.push(args); return { ok: true }; })('course', 'lesson', () => {});
  save(123.8, 500.9);
  await tick();
  assert.equal(calls[0][0], '/api/auth/mobile/courses/course/progress');
  assert.deepEqual(JSON.parse(calls[0][1].body), { courseItemId: 'lesson', progress: 123, duration: 500 });
  assert.equal(calls[0][1].keepalive, true);
  assert.equal(calls[0][1].credentials, 'same-origin');
});
test('serializes writes and preserves the latest position, including backward seeks', async () => {
  const positions = [];
  let finish;
  const save = load(async (_, options) => {
    positions.push(JSON.parse(options.body).progress);
    if (positions.length === 1) await new Promise(resolve => { finish = resolve; });
    return { ok: true };
  })('course', 'lesson', () => {});
  save(120, 500);
  save(150, 500);
  save(40, 500);
  assert.deepEqual(positions, [120]);
  finish();
  await tick();
  assert.deepEqual(positions, [120, 40]);
  save(40, 500);
  await tick();
  assert.deepEqual(positions, [120, 40]);
});
test('retries failed positions and reports recovery', async () => {
  const states = [];
  let attempts = 0;
  const save = load(async () => ({ ok: ++attempts > 1 }))('course', 'lesson', failed => states.push(failed));
  save(30, 500);
  await tick();
  save(30, 500);
  await tick();
  assert.equal(attempts, 2);
  assert.deepEqual(states, [true, false]);
});
test('ignores invalid media values and clamps positions to duration', async () => {
  const positions = [];
  const save = load(async (_, options) => { positions.push(JSON.parse(options.body).progress); return { ok: true }; })('course', 'lesson', () => {});
  save(NaN, 500); save(-1, 500); save(30, Infinity); save(30, 0);
  save(600, 500);
  await tick();
  assert.deepEqual(positions, [500]);
});
