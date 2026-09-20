const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');
const exportsObject = {};
let certificate;
let fetched = 0;
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/sesWebhook.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, {
  exports: exportsObject, require, Buffer, URL, AbortSignal,
  fetch: async () => { fetched++; return { ok: true, text: async () => certificate }; },
});
const { signingString, verifySnsMessage, eventUpdate, sesEventSchema, statusPriority } = exportsObject;
const envelope = {
  Type: 'Notification', Message: '{}', MessageId: 'sns-id',
  TopicArn: 'arn:aws:sns:ap-south-1:123456789012:ses', Timestamp: '2026-09-20T00:00:00Z',
  SignatureVersion: '2', SigningCertURL: 'https://sns.ap-south-1.amazonaws.com/SimpleNotificationService-test.pem',
};
test('verifies signatures and rejects tampering and untrusted certificate URLs', async () => {
  const pair = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  certificate = pair.publicKey.export({ type: 'spki', format: 'pem' });
  for (const version of ['1', '2']) {
    const message = { ...envelope, SignatureVersion: version };
    message.Signature = crypto.sign(version === '1' ? 'RSA-SHA1' : 'RSA-SHA256', Buffer.from(signingString(message)), pair.privateKey).toString('base64');
    await verifySnsMessage(message);
    await assert.rejects(verifySnsMessage({ ...message, Message: 'tampered' }), /Invalid SNS signature/);
    const count = fetched;
    await assert.rejects(verifySnsMessage({ ...message, SigningCertURL: 'https://evil.example/cert.pem' }), /certificate URL/);
    assert.equal(fetched, count);
  }
});
test('canonical field ordering includes optional subject and signed subscription fields', () => {
  assert.equal(signingString({ ...envelope, Subject: 'hello' }),
    `Message\n{}\nMessageId\nsns-id\nSubject\nhello\nTimestamp\n${envelope.Timestamp}\nTopicArn\n${envelope.TopicArn}\nType\nNotification\n`);
  assert.throws(() => signingString({ ...envelope, Type: 'SubscriptionConfirmation' }), /Missing SNS/);
  assert.match(signingString({ ...envelope, Type: 'SubscriptionConfirmation', Token: 'token', SubscribeURL: 'https://example.com' }), /SubscribeURL\nhttps:\/\/example.com\nTimestamp/);
});
const mail = { messageId: 'ses-id', timestamp: '2026-09-20T00:00:00Z', destination: ['a@example.com', 'b@example.com'] };
test('bounce targets only affected recipients and retains diagnostics', () => {
  const result = eventUpdate(sesEventSchema.parse({ eventType: 'Bounce', mail, bounce: {
    bounceType: 'Permanent', bouncedRecipients: [{ emailAddress: 'b@example.com', diagnosticCode: '550 unknown' }],
  } }));
  assert.equal(result.status, 'bounced');
  assert.equal(result.recipients.join(','), 'b@example.com');
  assert.equal(result.failureReason, 'Permanent');
  assert.equal(result.diagnostics[0].diagnosticCode, '550 unknown');
  assert.equal(result.openedAt, null);
});
test('open timestamps, legacy notifications, unsupported types and state priority', () => {
  const result = eventUpdate(sesEventSchema.parse({ eventType: 'Open', mail, open: { timestamp: '2026-09-20T01:00:00Z' } }));
  assert.equal(result.openedAt.toISOString(), '2026-09-20T01:00:00.000Z');
  assert.equal(eventUpdate({ notificationType: 'Delivery', mail }).status, 'delivered');
  assert.equal(eventUpdate({ eventType: 'Subscription', mail }), null);
  assert.ok(statusPriority.complained > statusPriority.bounced);
  assert.ok(statusPriority.bounced > statusPriority.opened);
  assert.ok(statusPriority.opened > statusPriority.delivered);
  assert.ok(statusPriority.delivered > statusPriority.sent);
  assert.equal(sesEventSchema.safeParse({ eventType: 'Open', mail, open: { timestamp: 'bad' } }).success, false);
});
