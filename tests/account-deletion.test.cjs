const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function setup({ invalidToken = false, wrongSubject = false, cognitoFailure = false } = {}) {
  const events = [];
  class JOSEError extends Error {}
  class AdminGetUserCommand {}
  class AdminDeleteUserCommand {}
  const tx = {
    select: () => ({ from: () => ({ where: () => ({ for: async () => [{ id: 'account-id' }] }) }) }),
    delete: (table) => ({ where: async () => events.push(`delete:${table.name}`) }),
  };
  const dependencies = {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
    jose: {
      createRemoteJWKSet: () => ({}), errors: { JOSEError },
      jwtVerify: async (_token, _keys, options) => {
        assert.equal(options.audience, 'client');
        assert.deepEqual(Array.from(options.algorithms), ['RS256']);
        if (invalidToken) throw new JOSEError();
        return { payload: { sub: 'subject', email: 'USER@example.com', email_verified: true, token_use: 'id', 'cognito:username': 'subject' } };
      },
    },
    '@aws-sdk/client-cognito-identity-provider': {
      AdminGetUserCommand, AdminDeleteUserCommand,
      CognitoIdentityProviderClient: class {
        async send(command) {
          if (command instanceof AdminGetUserCommand) {
            return { Enabled: true, UserAttributes: [{ Name: 'sub', Value: wrongSubject ? 'other' : 'subject' }] };
          }
          events.push('cognito:delete');
          if (cognitoFailure) throw new Error('Cognito unavailable');
        }
      },
    },
    'drizzle-orm': { eq: () => ({}), or: () => ({}), sql: () => ({}) },
    '@/lib/dbConfig': { db: { transaction: async (fn) => {
      try { await fn(tx); events.push('commit'); }
      catch (error) { events.push('rollback'); throw error; }
    } } },
    '@/db': Object.fromEntries(['user', 'workshopRegistration', 'seminarRegistrations'].map(name => [name, { name }])),
    '@/env': { AWS_COGNITO_REGION: 'region', USER_POOL_ID: 'pool', USER_POOL_CLIENT_ID: 'client' },
  };
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync('app/api/auth/mobile/account/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports, require: (id) => {
    assert.ok(dependencies[id], `Unexpected dependency: ${id}`);
    return dependencies[id];
  }, URL, console: { error() {} } });
  return { run: (token = 'Bearer token') => exports.DELETE(new Request('https://example.com/api/auth/mobile/account', { method: 'DELETE', headers: token ? { authorization: token } : {} })), events };
}

test('missing credentials cause no mutations', async () => {
  const { run, events } = setup();
  assert.equal((await run('')).status, 401);
  assert.deepEqual(events, []);
});
test('invalid token causes no mutations', async () => {
  const { run, events } = setup({ invalidToken: true });
  assert.equal((await run()).status, 401);
  assert.deepEqual(events, []);
});
test('a token for a replaced Cognito identity cannot delete an account', async () => {
  const { run, events } = setup({ wrongSubject: true });
  assert.equal((await run()).status, 401);
  assert.deepEqual(events, []);
});
test('deletes dependent registrations before the user and commits after Cognito succeeds', async () => {
  const { run, events } = setup();
  assert.equal((await run()).body.success, true);
  assert.deepEqual(events, ['delete:workshopRegistration', 'delete:seminarRegistrations', 'delete:user', 'cognito:delete', 'commit']);
});
test('Cognito failure rolls back database deletion and returns an error', async () => {
  const { run, events } = setup({ cognitoFailure: true });
  assert.equal((await run()).status, 500);
  assert.equal(events.at(-1), 'rollback');
  assert.ok(!events.includes('commit'));
});
