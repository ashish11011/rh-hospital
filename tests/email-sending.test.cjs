const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, modules) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require: name => {
    if (!(name in modules)) throw new Error(name);
    return modules[name];
  }, console: { log() {}, error() {} }, process: { env: { SES_CONFIGURATION_SET: 'tracking' } } });
  return exports;
}
const orm = { and: (...args) => args, eq: (...args) => args, inArray: (...args) => args, sql: (...args) => args };
class Command { constructor(input) { this.input = input; } }
function sender({ sendError, updateError, createError } = {}) {
  const calls = [];
  const api = load('lib/sendLoggedEmail.ts', {
    '@aws-sdk/client-ses': { SendEmailCommand: Command, SESClient: class {
      async send(command) { calls.push(['send', command.input]); if (sendError) throw sendError; return { MessageId: 'ses-1' }; }
    } },
    '@/env': {}, 'drizzle-orm': orm, '@/db/userSchema': { emailLogsSchema: {} },
    '@/lib/dbConfig': { db: { update: () => ({ set: value => ({ where: async () => {
      calls.push(['update', value]); if (updateError) throw updateError;
    } }) }) } },
    '@/lib/emailLogging': {
      createEmailLogs: async (...args) => { calls.push(['create', ...args]); if (createError) throw createError; return { ids: ['log-1'], sendAttemptId: 'attempt-1' }; },
      recordEmailFailure: async (...args) => calls.push(['failure', ...args]),
    },
  });
  return { ...api, calls };
}
const command = () => new Command({ Destination: { ToAddresses: ['a@example.com'], CcAddresses: ['b@example.com'] },
  Message: { Subject: { Data: 'Hello' } }, Tags: [{ Name: 'custom', Value: 'yes' }] });
test('logs before SES send, includes all recipients, preserves tags, and records message ID', async () => {
  const { sendLoggedEmail, calls } = sender();
  await sendLoggedEmail(command());
  assert.equal(calls.map(c => c[0]).join(','), 'create,send,update');
  assert.equal(calls[0][1].join(','), 'a@example.com,b@example.com');
  assert.equal(calls[1][1].ConfigurationSetName, 'tracking');
  assert.equal(calls[1][1].Tags[1].Value, 'attempt-1');
  assert.equal(calls[2][1].sesMessageId, 'ses-1');
});
test('SES recipients and log recipients are trimmed and lowercased across To, Cc and Bcc', async () => {
  const api = sender();
  await api.sendLoggedEmail(new Command({ Destination: {
    ToAddresses: [' Member@Example.COM '], CcAddresses: [' TEAM@Example.COM '], BccAddresses: [' Audit@Example.COM '],
  }, Message: { Subject: { Data: 'Hello' } } }));
  assert.equal(api.calls[0][1].join(','), 'member@example.com,team@example.com,audit@example.com');
  const destination = api.calls[1][1].Destination;
  assert.equal(destination.ToAddresses[0], 'member@example.com');
  assert.equal(destination.CcAddresses[0], 'team@example.com');
  assert.equal(destination.BccAddresses[0], 'audit@example.com');
});
test('SES errors are logged and rethrown; failed initial log prevents send', async () => {
  const error = new Error('SES rejected');
  const a = sender({ sendError: error });
  await assert.rejects(a.sendLoggedEmail(command()), error);
  assert.equal(a.calls.map(c => c[0]).join(','), 'create,send,failure');
  const b = sender({ createError: new Error('DB down') });
  await assert.rejects(b.sendLoggedEmail(command()), /DB down/);
  assert.equal(b.calls.length, 1);
});
test('accepted send remains successful if persistence fails, avoiding duplicate retries', async () => {
  const api = sender({ updateError: new Error('DB down') });
  assert.equal((await api.sendLoggedEmail(command())).MessageId, 'ses-1');
  assert.equal(api.calls.some(c => c[0] === 'failure'), false);
});
test('Cognito requests log recipients without a user and distinguish requested from not sent', async () => {
  const inserts = [], updates = [];
  const api = load('lib/emailLogging.ts', {
    'node:crypto': { randomUUID: () => 'attempt-id' }, 'drizzle-orm': orm,
    '@/db/userSchema': { emailLogsSchema: {}, userSchema: {} },
    '@/lib/dbConfig': { db: {
      select: () => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) }),
      insert: () => ({ values: value => { inserts.push(value); return { returning: async () => [{ id: 'log' }] }; } }),
      update: () => ({ set: value => ({ where: async () => { updates.push(value); } }) }),
    } },
  });
  await api.logCognitoEmail(' New@Example.COM ', 'signup', async () => ({ CodeDeliveryDetails: { DeliveryMedium: 'EMAIL' } }));
  assert.equal(inserts[0][0].userId, null);
  assert.equal(inserts[0][0].email, 'new@example.com');
  assert.equal(updates[0].status, 'requested');
  await api.logCognitoEmail('new@example.com', 'signup', async () => ({}));
  assert.equal(updates[1].status, 'not_sent');
  await assert.rejects(api.logCognitoEmail('new@example.com', 'reset', async () => { throw new Error('rejected'); }), /rejected/);
  assert.equal(updates[2].status, 'failed');
  await api.createEmailLogs([' New@Example.COM ', 'new@example.com'], 'deduplicated');
  assert.equal(inserts[3].length, 1);
  assert.equal(inserts[3][0].email, 'new@example.com');
});
