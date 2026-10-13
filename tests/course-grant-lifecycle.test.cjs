const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const tick = () => new Promise(resolve => setImmediate(resolve));
const web = fs.readFileSync(path.join(__dirname,'../lib/courseGrantLifecycle.ts'),'utf8');
const mobile = fs.readFileSync(path.join(__dirname,'../../my-app/lib/courseGrantLifecycle.ts'),'utf8');
function harness(request, install) {
  let now = 1_000_000, sequence = 0;
  const timers = new Map(), ready = [], failures = [];
  const exports = {};
  vm.runInNewContext(ts.transpileModule(web,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, {
    exports, Error, Date:{now:() => now},
    setTimeout:(callback,delay) => { const id=++sequence; timers.set(id,{callback,at:now+delay}); return id; },
    clearTimeout:id => timers.delete(id),
  });
  let calls = 0;
  const lifecycle = exports.createCourseGrantLifecycle({
    request:async () => { calls++; return request ? request(calls,now) : {expiresAt:(now+3_600_000)/1000}; },
    install:async grant => { if (install) await install(grant); ready.push(grant); },
    unavailable:error => failures.push(error),
  });
  return { lifecycle, ready, failures, calls:() => calls, timers,
    advance:async milliseconds => {
      now += milliseconds;
      for (const [id,timer] of [...timers]) { if (timer.at<=now) { timers.delete(id); timer.callback(); } }
      await tick();
    } };
}
test('website and native app use the identical grant lifecycle', () => assert.equal(web,mobile));
test('serializes startup, retries and foreground grants; renews five minutes before expiry', async () => {
  const h=harness();
  const start=h.lifecycle.renew();
  void h.lifecycle.foreground();
  await start;
  assert.equal(h.calls(),1);
  await h.advance(55*60*1000);
  assert.equal(h.calls(),2);
  assert.equal(h.failures.length,0);
  h.lifecycle.dispose();
  assert.equal(h.timers.size,0);
});
test('transient renewal failures retain access until expiry, even if a renewal request hangs', async () => {
  const h=harness((calls,now) => calls===1 ? {expiresAt:(now+3_600_000)/1000} : calls===2 ? Promise.reject(Object.assign(new Error('Temporary error'),{status:503})) : new Promise(()=>{}));
  await h.lifecycle.renew();
  await h.advance(55*60*1000);
  assert.equal(h.failures.length,0);
  await h.advance(30_000);
  assert.equal(h.calls(),3);
  await h.advance(5*60*1000);
  assert.match(h.failures[0].message,/expired/);
  h.lifecycle.dispose();
});
test('denied renewal immediately clears access and stops automatic requests', async () => {
  const h=harness((calls,now) => calls===1 ? {expiresAt:(now+3_600_000)/1000} : Promise.reject(Object.assign(new Error('Course refunded'),{status:403})));
  await h.lifecycle.renew();
  await h.lifecycle.foreground();
  assert.equal(h.failures[0].status,403);
  assert.equal(h.timers.size,0);
  await h.lifecycle.renew();
  assert.equal(h.calls(),2);
});
test('initial outage retries and disposal ignores a late grant', async () => {
  const h=harness((calls,now) => calls===1 ? Promise.reject(new Error('Offline')) : {expiresAt:(now+3_600_000)/1000});
  await h.lifecycle.renew();
  assert.equal(h.failures.length,1);
  await h.advance(30_000);
  assert.equal(h.ready.length,1);
  h.lifecycle.dispose();
  let finish;
  const late=harness(() => new Promise(resolve => {finish=resolve;}));
  const pending=late.lifecycle.renew();
  late.lifecycle.dispose();
  finish({expiresAt:5000});
  await pending;
  assert.equal(late.ready.length,0);
  assert.equal(late.timers.size,0);
});
test('failed native installation clears access instead of keeping a loading screen indefinitely', async () => {
  const h=harness(undefined,() => {throw new Error('Player failed to load');});
  await h.lifecycle.renew();
  assert.equal(h.failures.length,1);
  assert.equal(h.ready.length,0);
  assert.equal(h.timers.size,1);
  h.lifecycle.dispose();
});
